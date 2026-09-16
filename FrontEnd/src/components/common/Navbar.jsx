import { useEffect, useRef, useState } from "react";
import Modal from "../ui/Modal";
import { Link } from "react-router-dom";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import { useAccount } from "../../features/accounts/AccountContext"; // adjust path to match your tree
import authApi from "../../services/authApi";

const NAV_DATA = {
  accounts: [
    {
      id: "savings",
      label: "Savings Accounts",
      items: [
        "Senior Citizen Vishesh Samman SB",
        "Masterstroke LITE Saving Bank Account",
        "LITE Savings Account",
        "Family Savings Accounts Segment",
        "Champ Account",
        "Women Sapphire Savings Account",
        "Masterstroke Saving Bank Account",
        "BRO Saving Account",
        "Advantage Saving Account",
        "Super Savings Account",
      ],
      viewAllItems: "View All Saving Accounts",
      cta: {
        button: "Open a Savings Account Digitally",
        links: ["Application Form", "FAQs", "Contact Us"],
        viewAll: "View All Accounts",
      },
    },
    {
      id: "salary",
      label: "Salary Accounts",
      items: [
        "Premium Salary Account",
        "Classic Salary Account",
        "Defence Salary Account",
        "Government Salary Account",
      ],
      viewAllItems: "View All Salary Accounts",
      cta: {
        button: "Open a Salary Account",
        links: ["Eligibility", "Contact Us"],
        viewAll: "View All Accounts",
      },
    },
    {
      id: "current",
      label: "Current Account",
      items: [
        "Regular Current Account",
        "Premium Current Account",
        "Business Current Account",
        "Startup Current Account",
      ],
      viewAllItems: "View All Current Accounts",
      cta: {
        button: "Open a Current Account",
        links: ["Documents Required", "Contact Us"],
        viewAll: "View All Accounts",
      },
    },
    {
      id: "fixed-deposit",
      label: "Fixed Deposit",
      items: [
        "Regular Fixed Deposit",
        "Tax Saving Fixed Deposit",
        "Senior Citizen FD",
        "Recurring Deposit",
      ],
      viewAllItems: "View All Fixed Deposits",
      cta: {
        button: "Open a Fixed Deposit",
        links: ["Interest Rates", "FD Calculator"],
        viewAll: "View All Accounts",
      },
    },
    {
      id: "sdp",
      label: "bob SDP (Recurring Deposits)",
      items: ["Standard SDP", "Flexi SDP", "Junior SDP"],
      viewAllItems: "View All SDP Options",
      cta: {
        button: "Open a Recurring Deposit",
        links: ["Interest Rates", "Contact Us"],
        viewAll: "View All Accounts",
      },
    },
  ],
  loan: [
    {
      id: "home-loan",
      label: "Home Loan",
      items: [
        "Regular Home Loan",
        "Home Loan Top-Up",
        "Home Improvement Loan",
        "Plot Purchase Loan",
        "Balance Transfer",
        "NRI Home Loan",
      ],
      viewAllItems: "View All Home Loan Products",
      cta: {
        button: "Apply for Home Loan",
        links: ["EMI Calculator", "Documents Required", "Contact Us"],
        viewAll: "View All Loans",
      },
    },
    {
      id: "personal-loan",
      label: "Personal Loan",
      items: [
        "Regular Personal Loan",
        "Pre-Approved Personal Loan",
        "Personal Loan for Pensioners",
        "Personal Loan Top-Up",
      ],
      viewAllItems: "View All Personal Loan Products",
      cta: {
        button: "Apply for Personal Loan",
        links: ["EMI Calculator", "Check Eligibility"],
        viewAll: "View All Loans",
      },
    },
    {
      id: "car-loan",
      label: "Car Loan",
      items: ["New Car Loan", "Used Car Loan", "Car Loan Balance Transfer"],
      viewAllItems: "View All Car Loan Products",
      cta: {
        button: "Apply for Car Loan",
        links: ["EMI Calculator", "Contact Us"],
        viewAll: "View All Loans",
      },
    },
    {
      id: "education-loan",
      label: "Education Loan",
      items: ["Domestic Education Loan", "Study Abroad Loan", "Skill Loan"],
      viewAllItems: "View All Education Loan Products",
      cta: {
        button: "Apply for Education Loan",
        links: ["Eligibility", "Documents Required"],
        viewAll: "View All Loans",
      },
    },
  ],

  profile: [
    {
      id: "personal-info",
      label: "Personal Info",
      interactive: false, // display-only, not a navigable scheme/product
      items: [
        "Name — Rohan Deshmukh",
        "Customer ID — CUS-4471029",
        "Mobile — +91 98xxxxxx21",
        "Email — rohan.d@example.com",
      ],
      viewAllItems: "View Full Profile",
      cta: {
        button: "Edit Profile",
        links: ["Update KYC", "Contact Us"],
        viewAll: "View Full Profile",
      },
    },
    {
      id: "security",
      label: "Security & Login",
      interactive: false,
      items: [
        "2-Factor Auth — Enabled",
        "Last Login — Today, 9:12 AM",
        "Registered Device — iPhone 15",
      ],
      viewAllItems: "View Security Settings",
      cta: {
        button: "Manage Security",
        links: ["Change Password", "Contact Us"],
        viewAll: "View Security Settings",
      },
    },
    {
      id: "preferences",
      label: "Preferences",
      interactive: false,
      items: ["SMS Alerts — On", "Email Statements — On", "Language — English"],
      viewAllItems: "View All Preferences",
      cta: {
        button: "Edit Preferences",
        links: ["Notification Settings", "Contact Us"],
        viewAll: "View All Preferences",
      },
    },
  ],
};

const NAV_ITEMS = [
  { key: "accounts", label: "Accounts" },
  { key: "loan", label: "Loan" },
  { key: "profile", label: "Profile" },
];

// Maps an "accounts" sub-category id to the accountType stored in AccountContext.
const ACCOUNT_TYPE_MAP = {
  savings: "SAVINGS",
  salary: "SALARY",
  current: "CURRENT",
  "fixed-deposit": "FIXED_DEPOSIT",
  sdp: "RD",
};

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  const barRef = useRef(null);
  const itemRefs = useRef({});
  const authRef = useRef(null);

  const { setAccountType, setAccountScheme } = useAccount();

  const updateIndicator = (key) => {
    const el = itemRefs.current[key];
    const bar = barRef.current;
    if (!el || !bar) return;
    const elRect = el.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();
    setIndicator({
      left: elRect.left - barRect.left,
      width: elRect.width,
      opacity: 1,
    });
  };

  const handleLogout = async () => {
    try {
      await authApi.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      logout(); // clears in-memory token + isAuthenticated regardless
    }
  };

  useEffect(() => {
    if (!activeMenu) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    updateIndicator(activeMenu);
    const onResize = () => updateIndicator(activeMenu);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeMenu]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (authRef.current && !authRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Fired when a specific scheme/product item is clicked in the mega menu.
  function handleItemSelect(menuKey, section, item) {
    if (menuKey === "accounts") {
      setAccountType(ACCOUNT_TYPE_MAP[section.id] ?? null);
      setAccountScheme(item);
    }
    setActiveMenu(null);
  }

  // Fired when the panel's main CTA button (e.g. "Open a Savings Account Digitally") is clicked.
  function handleCtaSelect(menuKey, section) {
    if (menuKey === "accounts") {
      setAccountType(ACCOUNT_TYPE_MAP[section.id] ?? null);
      setAccountScheme(null); // let them pick the exact scheme on the form
    }
    setActiveMenu(null);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

        .nb-header, .nb-header * { box-sizing: border-box; }
        .nb-header {
          --ink: #0B2B26;
          --ink-2: #123832;
          --coral: #FF6B4A;
          --coral-dark: #E24E2C;
          --muted: #6E7C77;
          --border: #E4E0D6;
          position: sticky;
          top: 0;
          z-index: 50;
          background: #fff;
          border-bottom: 1px solid var(--border);
          font-family: 'Inter', sans-serif;
        }
        /* Added: several menu items are now <Link> (renders <a>) instead of <button> */
        .nb-header a { text-decoration: none; }

        .nb-bar {
          position: relative;
          max-width: 1152px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .nb-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .nb-brand-mark {
          width: 15px; height: 15px; border-radius: 3px;
          background: linear-gradient(135deg, var(--coral), #FFC49B);
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .nb-brand-word {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-size: clamp(1.1rem, 1rem + 0.4vw, 1.4rem);
          color: var(--ink);
          white-space: nowrap;
        }
        .nb-brand-word .accent {
          font-family: 'Inter', sans-serif;
          font-style: normal;
          font-weight: 600;
          color: var(--coral-dark);
          margin-left: 3px;
        }

        .nb-nav { display: flex; align-items: center; gap: 2px; }
        .nb-nav-btn {
          position: relative;
          padding: 9px 14px;
          border: none;
          background: transparent;
          font-size: clamp(13px, 12.5px + 0.2vw, 14.5px);
          font-weight: 500;
          color: var(--muted);
          border-radius: 8px;
          cursor: pointer;
          transition: color 180ms ease, background 180ms ease;
        }
        .nb-nav-btn:hover, .nb-nav-btn.is-active { color: var(--ink); background: rgba(11,43,38,0.05); }

        .nb-nav-indicator {
          position: absolute;
          bottom: 0;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, var(--coral), var(--coral-dark));
          transition: left 300ms cubic-bezier(.65,0,.35,1), width 300ms cubic-bezier(.65,0,.35,1), opacity 200ms ease;
        }

        .nb-auth { position: relative; }
        .nb-login-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark));
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 200ms ease;
        }
        .nb-login-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(255,107,74,0.3); }

        .nb-login-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 190px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 16px 32px -8px rgba(11,43,38,0.22);
          padding: 6px;
          transform-origin: top right;
          animation: menuIn 180ms cubic-bezier(.16,1,.3,1);
        }
        @keyframes menuIn {
          from { opacity: 0; transform: scale(.94) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .nb-login-menu-item {
          display: flex;
          align-items: center;
          gap: 9px;

          width: 100%;
          box-sizing: border-box;

          padding: 9px 10px;
          border-radius: 8px;

          border: none;
          background: transparent;

          font-family: inherit;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);

          text-decoration: none;
          text-align: left;

          cursor: pointer;
          transition: background 150ms ease;
        }

        .nb-login-menu-item:hover {
          background: rgba(11,43,38,0.06);
        }

        .nb-login-menu-item svg {
          color: var(--coral-dark);
        }

        /* ---- Mega menu (Modal.jsx) ---- */
        .meganav {
          position: absolute;
          inset-inline: 0;
          top: 100%;
          background: #fff;
          border-top: 1px solid var(--border);
          box-shadow: 0 24px 48px -16px rgba(11,43,38,0.18);
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: max-height 320ms cubic-bezier(.16,1,.3,1), opacity 240ms ease, transform 280ms cubic-bezier(.16,1,.3,1);
        }
        .meganav.is-open { max-height: 360px; opacity: 1; transform: translateY(0); pointer-events: auto; }
        .meganav-inner {
          max-width: 1152px;
          margin: 0 auto;
          padding: 28px 24px;
          display: grid;
          grid-template-columns: 216px 1fr 250px;
          gap: 28px;
        }

        .meganav-categories ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
        .meganav-cat-btn {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 9px 10px; border: none; background: transparent; border-radius: 8px;
          font-size: 13.5px; color: var(--muted); text-align: left; cursor: pointer;
          transition: background 180ms ease, color 180ms ease;
        }
        .meganav-cat-btn svg { flex-shrink: 0; color: var(--muted); transition: color 180ms ease; }
        .meganav-cat-btn:hover { background: rgba(11,43,38,0.04); color: var(--ink); }
        .meganav-cat-btn.is-active { background: rgba(11,43,38,0.07); color: var(--ink); font-weight: 600; }
        .meganav-cat-btn.is-active svg { color: var(--coral-dark); }

        .meganav-items { border-left: 1px solid var(--border); border-right: 1px solid var(--border); padding: 0 28px; }
        .meganav-items-heading { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; color: var(--ink); }
        .meganav-items-heading svg { color: var(--coral-dark); }
        .meganav-items-heading h3 {
          margin: 0;
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(1.05rem, 1rem + 0.3vw, 1.3rem);
        }
        .meganav-items-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; }
        .meganav-items-grid ul { list-style: none; margin: 0; padding: 0; }
        .meganav-items-grid li {
          border-bottom: 1px solid var(--border);
          animation: itemIn 260ms both;
          animation-delay: calc(var(--i) * 28ms);
        }
        .meganav-items-grid li:first-child { padding-top: 0; }
        /* Updated: item is now a <Link> for schemes, or a plain <span> for read-only profile rows */
        .meganav-items-grid button,
        .meganav-items-grid a {
          display: block;
          width: 100%; text-align: left; padding: 9px 0; border: none; background: transparent;
          font-size: 13.5px; color: #3F4A46; cursor: pointer; transition: color 160ms ease;
        }
        .meganav-items-grid button:hover,
        .meganav-items-grid a:hover { color: var(--coral-dark); }
        .meganav-items-grid span {
          display: block; padding: 9px 0; font-size: 13.5px; color: #3F4A46;
        }
        @keyframes itemIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        .meganav-viewall {
          margin-top: 14px; display: inline-flex; align-items: center; gap: 3px;
          border: none; background: transparent; padding: 0; cursor: pointer;
          font-size: 13px; font-weight: 600; color: var(--coral-dark);
        }
        .meganav-viewall-chevron { transition: transform 180ms ease; }
        .meganav-viewall:hover .meganav-viewall-chevron { transform: translateX(3px); }

        .meganav-cta {
          background: linear-gradient(160deg, rgba(11,43,38,0.045), rgba(255,107,74,0.06));
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        /* Updated: cta button is now a <Link>, needs explicit flex layout since <a> is inline by default */
        .meganav-cta-btn {
          width: 100%; padding: 11px 14px; border: none; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark));
          color: #fff; font-size: 13.5px; font-weight: 600; cursor: pointer;
          transition: transform 150ms ease, box-shadow 200ms ease;
        }
        .meganav-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(255,107,74,0.28); }
        .meganav-cta-links { list-style: none; margin: 14px 0 0; padding: 0; }
        .meganav-cta-links li + li { margin-top: 2px; }
        .meganav-cta-links button,
        .meganav-cta-links a {
          width: 100%; display: flex; align-items: center; gap: 6px;
          padding: 7px 6px; border: none; background: transparent; border-radius: 6px;
          font-size: 12.5px; color: var(--muted); cursor: pointer;
          transition: background 150ms ease, color 150ms ease;
        }
        .meganav-cta-links button svg,
        .meganav-cta-links a svg { color: var(--coral-dark); flex-shrink: 0; }
        .meganav-cta-links button:hover,
        .meganav-cta-links a:hover { background: rgba(11,43,38,0.05); color: var(--ink); }
        .meganav-cta-viewall {
          margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 4px; border: none; background: transparent;
          font-size: 12.5px; font-weight: 600; color: var(--ink); cursor: pointer;
        }
        .meganav-cta-viewall:hover .meganav-viewall-chevron { transform: translateX(3px); }

        .nb-header button:focus-visible,
        .nb-header a:focus-visible { outline: 2px solid var(--coral); outline-offset: 2px; }

        @media (prefers-reduced-motion: reduce) {
          .nb-header * { animation: none !important; transition: none !important; }
        }

        @media (max-width: 900px) {
          .nb-nav, .meganav { display: none; }
        }
      `}</style>

      <header className="nb-header" onMouseLeave={() => setActiveMenu(null)}>
        <div className="nb-bar" ref={barRef}>
          <Link to="/" className="nb-brand">
            <span className="nb-brand-mark" />
            <span className="nb-brand-word">
              Nexus<span className="accent">Bank</span>
            </span>
          </Link>

          <nav className="nb-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                ref={(el) => (itemRefs.current[item.key] = el)}
                onMouseEnter={() => setActiveMenu(item.key)}
                onFocus={() => setActiveMenu(item.key)}
                className={`nb-nav-btn ${
                  activeMenu === item.key ? "is-active" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <span
            className="nb-nav-indicator"
            style={{
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.opacity,
            }}
          />

          <div className="nb-auth" ref={authRef}>
            <button
              type="button"
              onClick={() => setIsSelected((v) => !v)}
              className="nb-login-btn"
            >
              {!isAuthenticated ? "Login" : "Logout"}
            </button>
            {isSelected && (
              <div className="nb-login-menu">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="nb-login-menu-item"
                    onClick={() => setIsSelected(false)}
                  >
                    <LogIn size={16} />
                    Login/Register
                  </Link>
                ) : (
                  <button
                    className="nb-login-menu-item"
                    onClick={() => {
                      handleLogout();
                      setIsSelected(false);
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                )}

                {!isAuthenticated && <Link
                  to="/admin-login"
                  className="nb-login-menu-item"
                  onClick={() => setIsSelected(false)}
                >
                  <LogIn size={16} />
                  Admin Login
                </Link>}
              </div>
            )}
          </div>

          <Modal
            isOpen={activeMenu !== null}
            menuKey={activeMenu}
            sections={NAV_DATA[activeMenu] || []}
            onClose={() => setActiveMenu(null)}
            onItemSelect={(section, item) =>
              handleItemSelect(activeMenu, section, item)
            }
            onCtaSelect={(section) => handleCtaSelect(activeMenu, section)}
          />
        </div>
      </header>
    </>
  );
}
