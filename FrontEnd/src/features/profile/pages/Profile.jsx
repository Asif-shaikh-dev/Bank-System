import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  ShieldCheck,
  Settings,
  Landmark,
  Pencil,
  KeyRound,
  Smartphone,
  Mail,
  IdCard,
  CalendarDays,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  PlusCircle,
} from "lucide-react";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import AccountCard from "../../accounts/components/AccountCard";
import { useAuth } from "../../../store/AuthContext";
import profileApi from "../profile.api";
import accountApi from "../../accounts/account.api";
import { formatDate } from "../../../utils/formatDate";
import {ONBOARDING_STATUS_LABEL } from "../../../utils/constants";

// No security/preferences table exists yet — these stay as local,
// editable-in-the-UI-only demo state until that's built.
const MOCK_SECURITY = {
  twoFactorEnabled: true,
  lastLogin: "Today, 9:12 AM",
  device: "iPhone 15",
};

const MOCK_PREFERENCES = {
  smsAlerts: true,
  emailStatements: true,
  language: "English",
};

const TABS = [
  { id: "personal-info", label: "Personal Info", icon: User },
  { id: "accounts", label: "Accounts & Balance", icon: Landmark },
  { id: "security", label: "Security & Login", icon: ShieldCheck },
  { id: "preferences", label: "Preferences", icon: Settings },
];

const getInitials = (name = "") =>
  name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const maskPan = (pan) => (pan ? `${pan.slice(0, 2)}••••${pan.slice(-2)}` : "—");
const maskAadhaar = (aadhaar) =>
  aadhaar ? `•••• •••• ${String(aadhaar).slice(-4)}` : "—";

export default function Profile() {
  const { section } = useParams();
  const navigate = useNavigate();

  const { profile } = useAuth();


  const activeTab = TABS.some((t) => t.id === section) ? section : "personal-info";

  const [application, setApplication] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sensitiveRevealed, setSensitiveRevealed] = useState(false);
  const [prefs, setPrefs] = useState(MOCK_PREFERENCES);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [app, accs] = await Promise.all([
          profileApi.getMyApplication(),
          accountApi.getMyAccounts(),
        ]);
        if (!cancelled) { setApplication(app); setAccounts(accs); }
      } catch (err) {
        console.error("Failed to load profile data:", err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  
  console.log("accounts :", accounts);
  const togglePref = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    // TODO: PATCH /api/profile/preferences
  };

  const displayName = profile?.name || application?.name || "there";
  const notImplemented = (label) => () => toast.info(`${label} is coming soon.`);

  return (
    <div className="profile-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

        .profile-shell, .profile-shell * { box-sizing: border-box; }
        .profile-shell {
          --ink: #0B2B26;
          --ink-2: #123832;
          --coral: #FF6B4A;
          --coral-dark: #E24E2C;
          --paper: #FBFAF8;
          --ink-text: #16231F;
          --muted: #6E7C77;
          --border: #E4E0D6;
          font-family: 'Inter', sans-serif;
          background: var(--paper);
          min-height: 100vh;
        }

        .profile-container { max-width: 1152px; margin: 0 auto; padding: 36px 24px 64px; }

        .profile-hero {
          display: flex; align-items: center; justify-content: space-between; gap: 18px;
          background: linear-gradient(160deg, var(--ink) 0%, var(--ink-2) 100%);
          border-radius: 20px; padding: 26px 28px; color: #fff; margin-bottom: 24px; flex-wrap: wrap;
        }
        .profile-hero-left { display: flex; align-items: center; gap: 18px; }
        .profile-avatar {
          width: 58px; height: 58px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Instrument Serif', serif; font-size: 1.4rem;
        }
        .profile-hero h1 { margin: 0; font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; font-size: 1.5rem; }
        .profile-hero p { margin: 4px 0 0; font-size: 12.5px; color: rgba(255,255,255,0.7); }

        .app-status { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; }
        .app-status.pending { background: rgba(255,196,155,0.2); color: #FFC49B; }
        .app-status.approved { background: rgba(30,122,61,0.2); color: #6FE39A; }
        .app-status.rejected { background: rgba(179,38,30,0.2); color: #FF9B94; }

        .profile-columns { display: grid; grid-template-columns: 240px 1fr; gap: 20px; align-items: start; }

        .profile-tabs { display: flex; flex-direction: column; gap: 4px; background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 8px; }
        .profile-tab {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 11px 12px; border: none; background: transparent; border-radius: 10px;
          font-size: 13.5px; font-weight: 500; color: var(--muted); text-align: left; cursor: pointer;
          transition: background 160ms ease, color 160ms ease;
        }
        .profile-tab svg { flex-shrink: 0; }
        .profile-tab:hover { background: rgba(11,43,38,0.05); color: var(--ink-text); }
        .profile-tab.is-active { background: rgba(255,107,74,0.1); color: var(--coral-dark); font-weight: 600; }

        .profile-panel { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
        .profile-panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .profile-panel-header h2 { margin: 0; font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; font-size: 1.2rem; color: var(--ink-text); }
        .profile-panel-header p { margin: 2px 0 0; font-size: 12.5px; color: var(--muted); }

        .profile-edit-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border: none; border-radius: 999px;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark));
          color: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer;
          transition: transform 150ms ease;
        }
        .profile-edit-btn:hover { transform: translateY(-1px); }

        .profile-reveal-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border: 1px solid var(--border); border-radius: 999px;
          background: #fff; font-size: 12.5px; font-weight: 600; color: var(--ink-text); cursor: pointer;
        }

        .info-row { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--border); }
        .info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .info-icon { width: 34px; height: 34px; border-radius: 9px; background: rgba(11,43,38,0.06); color: var(--ink); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .info-label { margin: 0; font-size: 11.5px; color: var(--muted); font-weight: 500; }
        .info-value { margin: 2px 0 0; font-size: 13.5px; font-weight: 600; color: var(--ink-text); }

        .sec-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
        .sec-status.on { background: rgba(30,122,61,0.1); color: #1E7A3D; }
        .sec-status.off { background: rgba(179,38,30,0.08); color: #B3261E; }

        .profile-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .profile-action-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 999px; border: 1px solid var(--border);
          background: #fff; font-size: 12.5px; font-weight: 600; color: var(--ink-text); cursor: pointer;
          transition: border-color 160ms ease;
        }
        .profile-action-btn:hover { border-color: var(--coral); color: var(--coral-dark); }

        .pref-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 0; border-bottom: 1px solid var(--border); }
        .pref-row:last-child { border-bottom: none; padding-bottom: 0; }
        .pref-row-label p.name { margin: 0; font-size: 13.5px; font-weight: 600; color: var(--ink-text); }
        .pref-row-label p.desc { margin: 2px 0 0; font-size: 12px; color: var(--muted); }

        .toggle { position: relative; width: 42px; height: 24px; border-radius: 999px; border: none; cursor: pointer; background: var(--border); transition: background 180ms ease; flex-shrink: 0; }
        .toggle.is-on { background: linear-gradient(135deg, var(--coral), var(--coral-dark)); }
        .toggle-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform 180ms ease; }
        .toggle.is-on .toggle-knob { transform: translateX(18px); }

        .lang-select {
          padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);
          font-size: 13px; font-family: inherit; color: var(--ink-text); background: #fff; cursor: pointer;
        }

        .accounts-tab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .accounts-tab-empty {
          border: 1px dashed var(--border); border-radius: 14px; padding: 24px; text-align: center; color: var(--muted);
        }
        .accounts-tab-empty p { margin: 0 0 14px; font-size: 13px; }
        .accounts-tab-new {
          display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 999px;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark)); color: #fff; text-decoration: none;
          font-size: 13px; font-weight: 600;
        }

        @media (max-width: 720px) {
          .profile-columns { grid-template-columns: 1fr; }
          .profile-tabs { flex-direction: row; overflow-x: auto; }
          .accounts-tab-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Navbar />

      <div className="profile-container">
        <div className="profile-hero">
          <div className="profile-hero-left">
            <div className="profile-avatar">{getInitials(displayName)}</div>
            <div>
              <h1>{displayName}</h1>
              <p>
                {profile ? profile.email_id : "Loading…"}
                {application && ` · Applied ${formatDate(application.created_at)}`}
              </p>
            </div>
          </div>
          {application && (
            <span
              className={`app-status ${
                application.status === "APPROVED"
                  ? "approved"
                  : application.status === "REJECTED"
                  ? "rejected"
                  : "pending"
              }`}
            >
              {ONBOARDING_STATUS_LABEL[application.status] || application.status}
            </span>
          )}
        </div>

        <div className="profile-columns">
          <nav className="profile-tabs" aria-label="Profile sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`profile-tab ${activeTab === tab.id ? "is-active" : ""}`}
                  onClick={() => navigate(`/profile/${tab.id}`, { replace: true })}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {activeTab === "personal-info" && (
            <div className="profile-panel">
              <div className="profile-panel-header">
                <div>
                  <h2>Personal Info</h2>
                  <p>Your KYC details on record with the bank</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="profile-reveal-btn"
                    onClick={() => setSensitiveRevealed((v) => !v)}
                  >
                    {sensitiveRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                    {sensitiveRevealed ? "Hide" : "Show"} PAN/Aadhaar
                  </button>
                  <button className="profile-edit-btn" onClick={notImplemented("Editing your profile")}>
                    <Pencil size={13} /> Edit
                  </button>
                </div>
              </div>

              {!profile ? (
  <p style={{ color: "#6E7C77", fontSize: 13.5 }}>Loading your details…</p>
) : (
  <>
    {/* Basic info: from /auth/me, same source as the navbar */}
    <div className="info-row">
      <span className="info-icon"><User size={16} /></span>
      <div>
        <p className="info-label">Full name</p>
        <p className="info-value">{profile.name}</p>
      </div>
    </div>
    <div className="info-row">
      <span className="info-icon"><Mail size={16} /></span>
      <div>
        <p className="info-label">Email</p>
        <p className="info-value">{profile.email_id}</p>
      </div>
    </div>
    <div className="info-row">
      <span className="info-icon"><Smartphone size={16} /></span>
      <div>
        <p className="info-label">Mobile</p>
        <p className="info-value">{profile.phone_masked}</p>
      </div>
    </div>

    {/* KYC details: only if the user has submitted an application */}
    {isLoading ? (
      <p style={{ color: "#6E7C77", fontSize: 13.5, marginTop: 14 }}>Loading KYC details…</p>
    ) : application ? (
      <>
        <div className="info-row">
          <span className="info-icon"><CalendarDays size={16} /></span>
          <div>
            <p className="info-label">Date of birth</p>
            <p className="info-value">{formatDate(application.date_of_birth)}</p>
          </div>
        </div>
        <div className="info-row">
          <span className="info-icon"><IdCard size={16} /></span>
          <div>
            <p className="info-label">PAN</p>
            <p className="info-value">
              {sensitiveRevealed ? application.pan_card_no : maskPan(application.pan_card_no)}
            </p>
          </div>
        </div>
        <div className="info-row">
          <span className="info-icon"><IdCard size={16} /></span>
          <div>
            <p className="info-label">Aadhaar</p>
            <p className="info-value">
              {sensitiveRevealed ? application.aadhaar_no : maskAadhaar(application.aadhaar_no)}
            </p>
          </div>
        </div>
        <div className="info-row">
          <span className="info-icon"><MapPin size={16} /></span>
          <div>
            <p className="info-label">Residential address</p>
            <p className="info-value">{application.residential_address}</p>
          </div>
        </div>
        <div className="info-row">
          <span className="info-icon"><Briefcase size={16} /></span>
          <div>
            <p className="info-label">Employment status · Source of income</p>
            <p className="info-value">
              {application.employment_status} · {application.source_of_income}
            </p>
          </div>
        </div>
      </>
    ) : (
      <div className="accounts-tab-empty" style={{ marginTop: 14 }}>
        <p>Complete KYC to see your full details here.</p>
        <Link to="/open-account" className="accounts-tab-new">
          <PlusCircle size={15} /> Open an account
        </Link>
      </div>
    )}
  </>
)}
            </div>
          )}

          {activeTab === "accounts" && (
            <div className="profile-panel">
              <div className="profile-panel-header">
                <div>
                  <h2>Accounts & Balance</h2>
                  <p>Every account you hold with NexusBank</p>
                </div>
                <Link to="/accounts" className="profile-edit-btn" style={{ textDecoration: "none" }}>
                  View all
                </Link>
              </div>

              {isLoading ? (
                  <p style={{ color: "#6E7C77", fontSize: 13.5 }}>Loading your details…</p>
                ) : !application ? (
                  <div className="accounts-tab-empty">
                    <p>No application on record yet.</p>
                    <Link to="/open-account" className="accounts-tab-new">
                      <PlusCircle size={15} /> Open an account
                    </Link>
                  </div>
                ) : accounts.length > 0 ? (
                <div className="accounts-tab-grid">
                  
                  {accounts.map((acc) => (
                    <AccountCard key={acc.id} account={acc} linkTo={`/accounts/${acc.id}`} />
                  ))}
                </div>
              ) : (
                <div className="accounts-tab-empty">
                  <p>
                    {application
                      ? `Your ${application.account_scheme} application is ${
                          ONBOARDING_STATUS_LABEL[application.status] || application.status
                        }. You'll see your balance here once it's approved.`
                      : "You don't have any accounts yet."}
                  </p>
                  <Link to="/open-account" className="accounts-tab-new">
                    <PlusCircle size={15} /> Open an account
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="profile-panel">
              <div className="profile-panel-header">
                <div>
                  <h2>Security & Login</h2>
                  <p>Keep your account locked down</p>
                </div>
              </div>

              <div className="info-row">
                <span className="info-icon"><ShieldCheck size={16} /></span>
                <div>
                  <p className="info-label">Two-factor authentication</p>
                  <p className="info-value">
                    <span className={`sec-status ${MOCK_SECURITY.twoFactorEnabled ? "on" : "off"}`}>
                      {MOCK_SECURITY.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon"><KeyRound size={16} /></span>
                <div>
                  <p className="info-label">Last login</p>
                  <p className="info-value">{MOCK_SECURITY.lastLogin}</p>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon"><Smartphone size={16} /></span>
                <div>
                  <p className="info-label">Registered device</p>
                  <p className="info-value">{MOCK_SECURITY.device}</p>
                </div>
              </div>

              <div className="profile-actions">
                <button className="profile-action-btn" onClick={notImplemented("Changing your password")}>
                  <KeyRound size={14} /> Change password
                </button>
                <button className="profile-action-btn" onClick={notImplemented("Managing two-factor auth")}>
                  <ShieldCheck size={14} /> Manage 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="profile-panel">
              <div className="profile-panel-header">
                <div>
                  <h2>Preferences</h2>
                  <p>How we keep you updated</p>
                </div>
              </div>

              <div className="pref-row">
                <div className="pref-row-label">
                  <p className="name">SMS alerts</p>
                  <p className="desc">Get a text for every debit and credit</p>
                </div>
                <button
                  type="button"
                  className={`toggle ${prefs.smsAlerts ? "is-on" : ""}`}
                  onClick={() => togglePref("smsAlerts")}
                  aria-label="Toggle SMS alerts"
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              <div className="pref-row">
                <div className="pref-row-label">
                  <p className="name">Email statements</p>
                  <p className="desc">Monthly statement sent to your inbox</p>
                </div>
                <button
                  type="button"
                  className={`toggle ${prefs.emailStatements ? "is-on" : ""}`}
                  onClick={() => togglePref("emailStatements")}
                  aria-label="Toggle email statements"
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              <div className="pref-row">
                <div className="pref-row-label">
                  <p className="name">Language</p>
                  <p className="desc">Used across statements and notifications</p>
                </div>
                <select
                  className="lang-select"
                  value={prefs.language}
                  onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}