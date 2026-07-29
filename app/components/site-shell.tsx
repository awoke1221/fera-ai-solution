// ─── Site shell — shared layout for every page ──────
// Wraps all pages with the header nav (with burger menu),
// scroll-progress bar, footer, and the FERA AI chatbot.

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useState, useRef } from "react";
import { FeraAIChat } from "./fera-ai-chat";
import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/stack-advisor", label: "Stack Advisor" },
];

// Simple in-memory cache — persists across SPA route changes
let cachedUserData: {
  user: any;
  profile: any;
  membership: any;
} | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navHidden, setNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const fetchedRef = useRef(false);

  const fetchUser = useCallback(async (force = false) => {
    // Use cached data if still fresh
    const now = Date.now();
    if (!force && cachedUserData && now - cacheTimestamp < CACHE_TTL) {
      setUser(cachedUserData.user);
      setProfile(cachedUserData.profile);
      setMembership(cachedUserData.membership);
      return;
    }
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      cachedUserData = {
        user: data.user,
        profile: data.profile,
        membership: data.membership,
      };
      cacheTimestamp = Date.now();
      setUser(data.user);
      setProfile(data.profile);
      setMembership(data.membership);
    } catch {
      setUser(null);
      setProfile(null);
      setMembership(null);
    }
  }, []);

  // Fetch on mount, then refresh only when pathname changes (SPA navigation)
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchUser();
    }
  }, []);

  // Refresh cache when navigating to a new page (e.g. after login redirect)
  useEffect(() => {
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Scroll progress (0–1)
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setScrollProgress(progress);

      // Smart nav: hide on scroll down, show on scroll up
      if (scrollTop > 80 && scrollTop > lastScrollY) {
        setNavHidden(true);
      } else if (scrollTop < lastScrollY || scrollTop <= 80) {
        setNavHidden(false);
      }
      setLastScrollY(scrollTop);

      // Close mobile menu on scroll
      if (menuOpen && scrollTop > 20) {
        setMenuOpen(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, menuOpen]);

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
      setUser(null);
      setProfile(null);
      setMembership(null);
      setProfileMenuOpen(false);
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
        <nav className="wrap">
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <img
              src="/fera-logo.jpg"
              alt="Fera AI Solutions logo"
              className="brand-mark"
            />
            <span className="brand-text">Fera AI Solutions</span>
          </Link>

          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`hamburger ${menuOpen ? "active" : ""}`}>
              <span />
              <span />
              <span />
            </span>
          </button>

          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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
            {user ? (
              <>
                {membership && (
                  <Link
                    href="/system-design"
                    className="btn solid"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontSize: "0.72rem", padding: "8px 14px" }}
                  >
                    💎 Premium
                  </Link>
                )}
                {profile?.is_admin && (
                  <Link
                    href="/admin/memberships"
                    className={pathname.startsWith("/admin") ? "active" : ""}
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/membership/dashboard"
                  className={
                    pathname === "/membership/dashboard" ? "active" : ""
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div
                  className={`user-profile-nav ${profileMenuOpen ? "open" : ""}`}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
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
                  <span className="user-name-nav">
                    {profile?.full_name ||
                      user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </span>
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <strong>
                        {profile?.full_name ||
                          user?.user_metadata?.full_name ||
                          "User"}
                      </strong>
                      <span>{user?.email}</span>
                    </div>
                    <Link
                      href="/membership/dashboard"
                      className="user-dropdown-item"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </Link>
                    {profile?.is_admin && (
                      <Link
                        href="/admin/memberships"
                        className="user-dropdown-item"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      type="button"
                      className="user-dropdown-item logout"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="btn solid"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
            <Link
              href="/book"
              className="btn"
              onClick={() => setMenuOpen(false)}
            >
              Start a project
            </Link>
          </div>
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
}
