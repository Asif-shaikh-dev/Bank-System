import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { ACCOUNT_TYPE_LABEL } from "../../../utils/constants";

const maskAccountNumber = (number = "") => `•••• •••• ${number.slice(-4)}`;

export default function AccountCard({ account, linkTo }) {
  const [revealed, setRevealed] = useState(false);
  if (!account) return null;

  const typeLabel = ACCOUNT_TYPE_LABEL[account.account_type] || account.account_type;

  return (
    <div className="acc-card">
      <style>{`
        .acc-card {
          --ink: #0B2B26; --ink-text: #16231F; --coral-dark: #E24E2C;
          --muted: #6E7C77; --border: #E4E0D6;
          background: #fff; border: 1px solid var(--border); border-radius: 16px;
          padding: 18px 20px; font-family: 'Inter', sans-serif;
        }
        .acc-card-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .acc-card-type { margin: 0; font-size: 13px; font-weight: 700; color: var(--ink-text); }
        .acc-card-scheme { margin: 2px 0 0; font-size: 12px; color: var(--muted); }
        .acc-card-toggle {
          border: none; background: rgba(11,43,38,0.06); width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: var(--ink); cursor: pointer;
        }
        .acc-card-balance { margin: 16px 0 2px; font-size: 1.35rem; font-weight: 700; color: var(--ink-text); }
        .acc-card-number { margin: 0; font-size: 12px; letter-spacing: 0.03em; color: var(--muted); }
        .acc-card-link {
          margin-top: 14px; display: inline-flex; align-items: center; gap: 4px;
          font-size: 12.5px; font-weight: 600; color: var(--coral-dark); text-decoration: none;
        }
      `}</style>

      <div className="acc-card-top">
        <div>
          <p className="acc-card-type">{typeLabel}</p>
          <p className="acc-card-scheme">{account.account_scheme}</p>
        </div>
        <button
          type="button"
          className="acc-card-toggle"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide balance" : "Show balance"}
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <p className="acc-card-balance">
        {revealed ? formatCurrency(account.balance) : "₹ •••••••"}
      </p>
      <p className="acc-card-number">
        {revealed ? account.account_number : maskAccountNumber(account.account_number)}
      </p>

      {linkTo && (
        <Link to={linkTo} className="acc-card-link">
          View details <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}