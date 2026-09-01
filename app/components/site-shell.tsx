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

const navGroups = [
  {
    label: "Services",
    description: "Strategy, delivery, and product acceleration",
    items: [
      {
        href: "/services",
        label: "Services",
        description: "Custom platform builds and AI transformations",
        icon: "✦",
      },
      {
        href: "/solutions",
        label: "Solutions",
        description: "Vertical products and execution frameworks",
        icon: "◎",
      },
      {
        href: "/projects",
        label: "Projects",
        description: "Case studies and measurable outcomes",
        icon: "▣",
      },
    ],
  },
  {
    label: "Company",
    description: "Who we are and how we work",
    items: [
      {
        href: "/about",
        label: "About",
        description: "Our mission and expertise",
        icon: "◌",
      },
      {
        href: "/process",
        label: "Process",
        description: "How delivery stays sharp",
        icon: "↗",
      },
      {
        href: "/contact",
        label: "Contact us",
        description: "Book a discovery call",
        icon: "✉",
      },
    ],
  },
  {
    label: "Learn",
    description: "Insights, coaching, and hands-on learning",
    items: [
      {
        href: "/tutorials",
        label: "Tutorials",
        description: "Practical learning resources",
        icon: "▤",
      },
      {
        href: "/membership/sessions",
        label: "Sessions",
        description: "Live group learning and workshops",
        icon: "◈",
      },
      {
        href: "/membership/one-to-one",
        label: "1:1",
        description: "Direct advisory and mentoring",
        icon: "◎",
      },
    ],
  },
];

export const SiteShell = memo(function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const navHiddenRef = useRef(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
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
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (!user || loading) return;

    const refreshAccess = () => {
      fetchUser(true);
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
          setOpenDropdown(null);
        }

        if (openDropdown && window.innerWidth <= 920 && scrollTop > 20) {
          setOpenDropdown(null);
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
  }, [menuOpen, openDropdown]);

  useEffect(() => {
    const handleNavigationKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setProfileMenuOpen(false);
        setOpenDropdown(null);
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!navRef.current?.contains(target)) {
        setMenuOpen(false);
        setOpenDropdown(null);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
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
            onClick={(e) => {
              if (window.innerWidth <= 920) {
                e.stopPropagation();
              }
            }}
          >
            {navGroups.map((group) => {
              const isGroupActive = group.items.some(
                (item) =>
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`),
              );

              return (
                <div
                  key={group.label}
                  className={`nav-dropdown-group ${
                    isGroupActive ? "active" : ""
                  } ${openDropdown === group.label ? "open" : ""}`}
                  onMouseEnter={() => {
                    if (window.innerWidth > 920) {
                      setOpenDropdown(group.label);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.innerWidth > 920) {
                      setOpenDropdown((current) =>
                        current === group.label ? null : current,
                      );
                    }
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    if (window.innerWidth <= 920) {
                      e.stopPropagation();
                    }
                  }}
                >
                  <button
                    type="button"
                    className="nav-dropdown-trigger"
                    aria-expanded={openDropdown === group.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Close previous dropdown and open new one
                      setOpenDropdown((current) =>
                        current === group.label ? null : group.label,
                      );
                    }}
                  >
                    <span className="nav-dropdown-label">{group.label}</span>
                    <span className="nav-dropdown-caret">▾</span>
                  </button>

                  <div className="nav-dropdown-menu" role="menu">
                    <div className="nav-dropdown-header">
                      <span>{group.label}</span>
                      <small>{group.description}</small>
                    </div>

                    <div className="nav-dropdown-grid">
                      {group.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-dropdown-item ${isActive ? "active" : ""}`}
                            onClick={() => {
                              setMenuOpen(false);
                              setOpenDropdown(null);
                            }}
                          >
                            <span className="nav-dropdown-icon">
                              {item.icon}
                            </span>
                            <span className="nav-dropdown-copy">
                              <strong>{item.label}</strong>
                              <small>{item.description}</small>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {!user && (
              <Link
                href="/stack-advisor"
                className={`nav-menu-link ${
                  pathname.startsWith("/stack-advisor") ? "active" : ""
                }`}
                onClick={() => {
                  setMenuOpen(false);
                  setOpenDropdown(null);
                }}
              >
                Stack Advisor
              </Link>
            )}

            {user && (
              <div className="mobile-user-panel">
                <div className="mobile-user-summary">
                  <img
                    src={
                      user?.user_metadata?.avatar_url ||
                      profile?.avatar_url ||
                      "/default-avatar.png"
                    }
                    alt={profile?.full_name || user?.email || "User"}
                    className="user-avatar-menu"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <strong>
                      {profile?.full_name ||
                        user?.user_metadata?.full_name ||
                        user?.email?.split("@")[0] ||
                        "User"}
                    </strong>
                    <span>{user?.email}</span>
                  </div>
                </div>

                <Link
                  href="/membership/dashboard"
                  className="user-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
                >
                  Dashboard
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="user-dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      setOpenDropdown(null);
                    }}
                  >
                    Admin
                  </Link>
                )}

                <Link
                  href="/membership/sessions"
                  className="user-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
                >
                  Sessions
                </Link>

                <button
                  type="button"
                  className="user-dropdown-item logout"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                    handleLogout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}

            <Link
              href="/book"
              className="btn nav-menu-cta"
              onClick={() => {
                setMenuOpen(false);
                setOpenDropdown(null);
              }}
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
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
                >
                  <span className="nav-feature-icon">✦</span>
                  Stack Advisor
                </Link>
                <div className="user-profile-wrap" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="user-profile-nav"
                    aria-label="Open user profile menu"
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      setProfileMenuOpen((open) => !open);
                      setMenuOpen(false);
                      setOpenDropdown(null);
                    }}
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
                  </button>

                  {profileMenuOpen && (
                    <div className="user-profile-menu" role="menu">
                      <div className="user-profile-summary">
                        <img
                          src={
                            user?.user_metadata?.avatar_url ||
                            profile?.avatar_url ||
                            "/default-avatar.png"
                          }
                          alt={profile?.full_name || user?.email || "User"}
                          className="user-avatar-menu"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <strong>
                            {profile?.full_name ||
                              user?.user_metadata?.full_name ||
                              user?.email?.split("@")[0] ||
                              "User"}
                          </strong>
                          <span>{user?.email}</span>
                        </div>
                      </div>

                      <Link
                        href="/membership/dashboard"
                        className="user-dropdown-item"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                      >
                        Dashboard
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="user-dropdown-item"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            setOpenDropdown(null);
                          }}
                        >
                          Admin
                        </Link>
                      )}

                      <Link
                        href="/membership/sessions"
                        className="user-dropdown-item"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                      >
                        Sessions
                      </Link>

                      <button
                        type="button"
                        className="user-dropdown-item logout"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setOpenDropdown(null);
                          handleLogout();
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="nav-login-link"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn solid nav-signup-link"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
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
