// ─── Site shell — shared layout for every page ──────
// Wraps all pages with the header nav (with burger menu),
// scroll-progress bar, footer, and the FERA AI chatbot.

"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { memo, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import useAuth from "../store/useAuth";

const FeraAIChat = dynamic(
  () => import("./fera-ai-chat").then((module) => module.FeraAIChat),
  {
    ssr: false,
    loading: () => null,
  },
);

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/solutions", label: "Solutions" },
  { href: "/projects", label: "Projects" },
  { href: "/process", label: "Process" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/membership/sessions", label: "Sessions" },
  { href: "/membership/one-to-one", label: "1:1" },
  { href: "/contact", label: "Contact" },
];

export const SiteShell = memo(function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const navHiddenRef = useRef(false);
  const user = useAuth((s: any) => s.user);
  const profile = useAuth((s: any) => s.profile);
  const loading = useAuth((s: any) => s.loading);
  const fetchUser = useAuth((s: any) => s.fetchUser);
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const isAdmin = profile?.is_admin || profile?.role === "admin";

  useEffect(() => {
    navHiddenRef.current = navHidden;
  }, [navHidden]);

  useEffect(() => {
    if (user === undefined && !loading) {
      fetchUser();
    }
  }, [user, loading, fetchUser]);

  useEffect(() => {
    if (!user || loading) return;

    const refreshAccess = () => {
      fetchUser();
    };

    const intervalId = window.setInterval(refreshAccess, 60_000);
    window.addEventListener("focus", refreshAccess);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshAccess);
    };
  }, [user, loading, fetchUser]);

  useEffect(() => {
    let animationFrameId = 0;

    const handleScroll = () => {
      if (animationFrameId) return;

      animationFrameId = window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

        setScrollProgress(progress);

        const shouldHide = scrollTop > 80 && scrollTop > lastScrollYRef.current;
        const shouldShow =
          scrollTop < lastScrollYRef.current || scrollTop <= 80;

        if (shouldHide && !navHiddenRef.current) {
          setNavHidden(true);
        } else if (shouldShow && navHiddenRef.current) {
          setNavHidden(false);
        }

        lastScrollYRef.current = scrollTop;

        if (menuOpen && scrollTop > 20) {
          setMenuOpen(false);
        }

        animationFrameId = 0;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleNavigationKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleNavigationKeys);
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("keydown", handleNavigationKeys);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const revealItems = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal"),
    );

    if (!revealItems.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // update global store
      const signOut = useAuth.getState().signOut;
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div
        className={`scroll-progress ${navHidden ? "hidden" : ""}`}
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <header className={navHidden ? "nav-hidden" : ""}>
        <nav className="wrap nav-shell" ref={navRef}>
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <img
              src="/fera-logo.jpg"
              alt="Fera AI Solutions logo"
              className="brand-mark"
            />
            <span className="brand-text">Fera AI Solutions</span>
          </Link>

          <div
            id="primary-navigation"
            className={`nav-links ${menuOpen ? "open" : ""}`}
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            {!user && (
              <Link
                href="/stack-advisor"
                className={`nav-menu-link ${
                  pathname.startsWith("/stack-advisor") ? "active" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Stack Advisor
              </Link>
            )}
            {user && (
              <div className="nav-auth-cluster">
                {isAdmin && (
                  <Link
                    href="/admin/memberships"
                    className={`nav-secondary-link ${
                      pathname.startsWith("/admin") ? "active" : ""
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/membership/dashboard"
                  className={`nav-secondary-link ${
                    pathname === "/membership/dashboard" ? "active" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="user-dropdown-item logout"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
            <Link
              href="/book"
              className="btn nav-menu-cta"
              onClick={() => setMenuOpen(false)}
            >
              Start a project
            </Link>
          </div>

          <div className="nav-visible-actions">
            {user ? (
              <>
                <Link
                  href="/stack-advisor"
                  className={`nav-feature-link ${
                    pathname.startsWith("/stack-advisor") ? "active" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="nav-feature-icon">✦</span>
                  Stack Advisor
                </Link>
                <div className="user-profile-nav" aria-label="User profile">
                  <img
                    src={
                      user?.user_metadata?.avatar_url ||
                      profile?.avatar_url ||
                      "/default-avatar.png"
                    }
                    alt={profile?.full_name || user?.email || "User"}
                    className="user-avatar-nav"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="nav-login-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn solid nav-signup-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className="menu-toggle"
            aria-label="Open navigation menu"
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`hamburger ${menuOpen ? "active" : ""}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </nav>
      </header>

      <main id="top">{children}</main>

      <footer>
        <div className="wrap">
          <div className="footer-main">
            <div className="footer-brand">
              <img
                src="/fera-logo.jpg"
                alt="Fera AI Solutions logo"
                className="brand-mark"
              />
              <span className="brand-text">Fera AI Solutions</span>
              <p className="footer-tagline">
                Advanced software engineering for modern platforms and AI-driven
                products.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Services</h4>
                <Link href="/services">Web Platforms</Link>
                <Link href="/services">AI Agents</Link>
                <Link href="/services">Custom Software</Link>
                <Link href="/services">ERP Systems</Link>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <Link href="/about">About</Link>
                <Link href="/projects">Our Work</Link>
                <Link href="/insights">Insights</Link>
                <Link href="/contact">Contact</Link>
              </div>
              <div className="footer-col">
                <h4>Contact</h4>
                <a href="mailto:hello@feraisolutions.com">
                  hello@feraisolutions.com
                </a>
                <span>East Africa · Europe · Remote</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Fera AI Solutions. All rights reserved.</p>
            <p>Built with Next.js + TypeScript + ♥</p>
          </div>
        </div>
      </footer>

      <FeraAIChat />
    </>
  );
});
