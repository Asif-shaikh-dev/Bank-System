import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Clock3 } from "lucide-react";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import AccountCard from "../components/AccountCard";
import accountApi from "../account.api";
import profileApi from "../../profile/profile.api";
import { useAuth } from "../../../store/AuthContext";
import { DEMO_USER_ID, ONBOARDING_STATUS_LABEL } from "../../../utils/constants";

export default function Accounts() {
  const { user } = useAuth();
  const userId = user?.user_id ?? DEMO_USER_ID;

  const [accounts, setAccounts] = useState([]);
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [accs, app] = await Promise.all([
        accountApi.getMyAccountsDemo(userId),
        profileApi.getMyApplicationDemo(userId),
      ]);
      if (!cancelled) {
        setAccounts(accs);
        setApplication(app);
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className="accounts-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        .accounts-shell, .accounts-shell * { box-sizing: border-box; }
        .accounts-shell {
          --ink: #0B2B26; --coral: #FF6B4A; --coral-dark: #E24E2C;
          --paper: #FBFAF8; --ink-text: #16231F; --muted: #6E7C77; --border: #E4E0D6;
          font-family: 'Inter', sans-serif; background: var(--paper); min-height: 100vh;
        }
        .accounts-container { max-width: 1152px; margin: 0 auto; padding: 36px 24px 64px; }
        .accounts-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; flex-wrap: wrap; gap: 10px; }
        .accounts-header h1 { margin: 0; font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; font-size: 1.6rem; color: var(--ink-text); }
        .accounts-header p { margin: 4px 0 0; font-size: 12.5px; color: var(--muted); }
        .accounts-new-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 999px;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark)); color: #fff; text-decoration: none;
          font-size: 13px; font-weight: 600;
        }
        .accounts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .accounts-empty {
          background: #fff; border: 1px dashed var(--border); border-radius: 16px;
          padding: 32px; text-align: center; color: var(--muted);
        }
        .accounts-empty svg { color: var(--coral-dark); margin-bottom: 10px; }
        .accounts-empty h3 { margin: 0 0 6px; color: var(--ink-text); font-size: 15px; }
        .accounts-empty p { margin: 0 0 16px; font-size: 13px; }
        @media (max-width: 720px) { .accounts-grid { grid-template-columns: 1fr; } }
      `}</style>

      <Navbar />

      <div className="accounts-container">
        <div className="accounts-header">
          <div>
            <h1>Your Accounts</h1>
            <p>All accounts held with NexusBank</p>
          </div>
          <Link to="/open-account" className="accounts-new-btn">
            <PlusCircle size={15} /> Open new account
          </Link>
        </div>

        {isLoading ? (
          <p style={{ color: "#6E7C77", fontSize: 13.5 }}>Loading your accounts…</p>
        ) : accounts.length > 0 ? (
          <div className="accounts-grid">
            {accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} linkTo={`/accounts/${acc.id}`} />
            ))}
          </div>
        ) : (
          <div className="accounts-empty">
            <Clock3 size={26} />
            <h3>
              {application
                ? `Your ${application.account_scheme} application is ${
                    ONBOARDING_STATUS_LABEL[application.status] || application.status
                  }`
                : "No accounts yet"}
            </h3>
            <p>
              {application
                ? "You'll see your account here as soon as it's approved."
                : "Open your first account to get started."}
            </p>
            <Link to="/open-account" className="accounts-new-btn">
              <PlusCircle size={15} /> Open an account
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}