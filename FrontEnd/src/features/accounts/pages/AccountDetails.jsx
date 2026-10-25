import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, FileText } from "lucide-react";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import accountApi from "../account.api";
import { formatCurrency } from "../../../utils/formatCurrency";
import { ACCOUNT_TYPE_LABEL } from "../../../utils/constants";
import AddMoney from "../../transactions/components/AddMoney";

const maskAccountNumber = (number = "") => `•••• •••• ${number.slice(-4)}`;

export default function AccountDetails() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const acc = await accountApi.getAccountByIdDemo(id);
      if (!cancelled) {
        setAccount(acc);
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="acc-details-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        .acc-details-shell, .acc-details-shell * { box-sizing: border-box; }
        .acc-details-shell {
          --ink: #0B2B26; --ink-2: #123832; --coral-dark: #E24E2C;
          --paper: #FBFAF8; --ink-text: #16231F; --muted: #6E7C77; --border: #E4E0D6;
          font-family: 'Inter', sans-serif; background: var(--paper); min-height: 100vh;
        }
        .acc-details-container { max-width: 720px; margin: 0 auto; padding: 36px 24px 64px; }
        .acc-details-back {
          display: inline-flex; align-items: center; gap: 6px; margin-bottom: 18px;
          font-size: 13px; font-weight: 600; color: var(--muted); text-decoration: none;
        }
        .acc-details-hero {
          background: linear-gradient(160deg, var(--ink) 0%, var(--ink-2) 100%); color: #fff;
          border-radius: 20px; padding: 28px 32px; margin-bottom: 20px;
        }
        .acc-details-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .acc-details-top p.label { margin: 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
        .acc-details-top p.scheme { margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.55); }
        .acc-details-toggle { border: none; background: rgba(255,255,255,0.1); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; }
        .acc-details-balance { margin: 22px 0 4px; font-family: 'Instrument Serif', serif; font-size: 2.2rem; }
        .acc-details-number { margin: 0; font-size: 13px; color: rgba(255,255,255,0.6); }
        .acc-details-panel { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 22px; }
        .acc-details-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 13.5px; }
        .acc-details-row:last-child { border-bottom: none; }
        .acc-details-row span:first-child { color: var(--muted); }
        .acc-details-row span:last-child { font-weight: 600; color: var(--ink-text); }
        .acc-details-statement {
          margin-top: 16px; display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 999px; border: 1px solid var(--border);
          background: #fff; font-size: 12.5px; font-weight: 600; color: var(--ink-text); text-decoration: none;
        }
      `}</style>

      <Navbar />

      <div className="acc-details-container">
        <Link to="/accounts" className="acc-details-back">
          <ArrowLeft size={14} /> Back to accounts
        </Link>

        {isLoading ? (
          <p style={{ color: "#6E7C77", fontSize: 13.5 }}>Loading account…</p>
        ) : !account ? (
          <div className="acc-details-panel">
            <p style={{ margin: 0 }}>We couldn't find that account.</p>
          </div>
        ) : (
          <>
            <div className="acc-details-hero">
              <div className="acc-details-top">
                <div>
                  <p className="label">{ACCOUNT_TYPE_LABEL[account.account_type] || account.account_type}</p>
                  <p className="scheme">{account.account_scheme}</p>
                </div>
                <button
                  type="button"
                  className="acc-details-toggle"
                  onClick={() => setRevealed((v) => !v)}
                  aria-label={revealed ? "Hide balance" : "Show balance"}
                >
                  {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="acc-details-balance">
                {revealed ? formatCurrency(account.balance) : "₹ •••••••"}
              </p>
              <AddMoney
                accountId={account.id}
                onDone={(newBalance) => setAccount((a) => ({ ...a, balance: newBalance }))}
              />
              <p className="acc-details-number">
                {revealed ? account.account_number : maskAccountNumber(account.account_number)}
              </p>
            </div>

            <div className="acc-details-panel">
              <div className="acc-details-row">
                <span>Account number</span>
                <span>{revealed ? account.account_number : maskAccountNumber(account.account_number)}</span>
              </div>
              <div className="acc-details-row">
                <span>Account type</span>
                <span>{ACCOUNT_TYPE_LABEL[account.account_type] || account.account_type}</span>
              </div>
              <div className="acc-details-row">
                <span>Scheme</span>
                <span>{account.account_scheme}</span>
              </div>
            </div>

            {/* /transactions isn't routed yet in App.jsx — uncomment it there first */}
            <Link to="/transactions" className="acc-details-statement">
              <FileText size={14} /> View statement
            </Link>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}