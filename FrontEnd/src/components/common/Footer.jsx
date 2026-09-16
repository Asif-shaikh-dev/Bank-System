import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const FOOTER_COLUMNS = [
  {
    heading: "Banking",
    links: [
      { label: "Savings Accounts", to: "/accounts" },
      { label: "Fixed Deposits", to: "/accounts" },
      { label: "Loans", to: "/loans" },
      { label: "Insurance", to: "/insurance" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", to: "#" },
      { label: "Contact Us", to: "#" },
      { label: "Branch Locator", to: "#" },
      { label: "FAQs", to: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "#" },
      { label: "Careers", to: "#" },
      { label: "Press", to: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", to: "#" },
      { label: "Privacy Policy", to: "#" },
      { label: "Security", to: "#" },
      { label: "Grievance Redressal", to: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="app-footer">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

        .app-footer, .app-footer * { box-sizing: border-box; }
        .app-footer {
          --ink: #0B2B26;
          --ink-2: #123832;
          --coral: #FF6B4A;
          --coral-dark: #E24E2C;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(160deg, var(--ink) 0%, var(--ink-2) 100%);
          color: rgba(255,255,255,0.72);
        }

        .ftr-inner { max-width: 1152px; margin: 0 auto; padding: 56px 24px 0; }

        .ftr-top { display: grid; grid-template-columns: 1.6fr repeat(4, 1fr); gap: 32px; padding-bottom: 40px; }

        .ftr-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; margin-bottom: 14px; }
        .ftr-brand-mark { width: 15px; height: 15px; border-radius: 3px; background: linear-gradient(135deg, var(--coral), #FFC49B); transform: rotate(45deg); flex-shrink: 0; }
        .ftr-brand-word { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 1.3rem; color: #fff; }
        .ftr-brand-word .accent { font-family: 'Inter', sans-serif; font-style: normal; font-weight: 600; color: #FFC49B; margin-left: 3px; }
        .ftr-blurb { font-size: 13px; line-height: 1.6; max-width: 280px; margin: 0 0 20px; }

        .ftr-contact { display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; margin-bottom: 20px; }
        .ftr-contact span { display: flex; align-items: center; gap: 8px; }
        .ftr-contact svg { color: var(--coral); flex-shrink: 0; }

        .ftr-social { display: flex; gap: 8px; }
        .ftr-social a {
          width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.08); color: #fff; transition: background 180ms ease;
        }
        .ftr-social a:hover { background: var(--coral); }

        .ftr-col h4 { margin: 0 0 14px; font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #fff; }
        .ftr-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .ftr-col a { font-size: 13px; color: rgba(255,255,255,0.65); text-decoration: none; transition: color 150ms ease; }
        .ftr-col a:hover { color: #fff; }

        .ftr-disclaimer {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 20px 0;
          font-size: 11.5px;
          line-height: 1.7;
          color: rgba(255,255,255,0.45);
        }

        .ftr-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 18px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          flex-wrap: wrap;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .ftr-top { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .ftr-top { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ftr-inner">
        <div className="ftr-top">
          <div>
            <Link to="/" className="ftr-brand">
              <span className="ftr-brand-mark" />
              <span className="ftr-brand-word">Nimbus <span className="accent">Bank</span></span>
            </Link>
            <p className="ftr-blurb">
              Digital-first banking built for everyday accounts, deposits, loans and insurance — all in one place.
            </p>
            <div className="ftr-contact">
              <span><Phone size={13} /> 1800-123-4567 (Toll free)</span>
              <span><Mail size={13} /> support@nimbusbank.example</span>
              <span><MapPin size={13} /> Pune, Maharashtra, India</span>
            </div>
            <div className="ftr-social">
              <a href="#" aria-label="Facebook"><FaFacebookF size={15} /></a>
              <a href="#" aria-label="Twitter"><FaTwitter size={15} /></a>
              <a href="#" aria-label="Instagram"><FaInstagram size={15} /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn size={15} /></a>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div className="ftr-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="ftr-disclaimer">
          This is a demo banking interface built for a college mini-project. No real financial transactions,
          deposits, or loans are processed. Account numbers, balances and figures shown are illustrative only.
        </p>

        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} Nimbus Bank. All rights reserved.</span>
          <span>Made for demonstration purposes only</span>
        </div>
      </div>
    </footer>
  );
}