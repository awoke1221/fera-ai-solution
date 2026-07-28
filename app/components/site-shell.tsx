// ─── Site shell — shared layout for every page ──────
// Wraps all pages with the header nav (with burger menu),
// scroll-progress bar, footer, and the FERA AI chatbot.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { FeraAIChat } from "./fera-ai-chat";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/solutions", label: "Solutions" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/insights", label: "Insights" },
  { href: "/system-design", label: "Learn" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      setUser(data.user);
      setProfile(data.profile);
      setMembership(data.membership);
    } catch {
      setUser(null);
      setProfile(null);
      setMembership(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setScrollProgress(progress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollProgress);
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

  return (
    <>
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <header>
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
                <Link
                  href="/membership/dashboard"
                  className={
                    pathname === "/membership/dashboard" ? "active" : ""
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
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
