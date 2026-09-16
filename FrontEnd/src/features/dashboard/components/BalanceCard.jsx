import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeftRight, FileText } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";

const maskAccountNumber = (number) => `•••• •••• ${number.slice(-4)}`;

export default function BalanceCard({ account }) {
  const [revealed, setRevealed] = useState(false);

  if (!account) return null;

  return (
    <div className="balance-hero">
      <div className="balance-hero-blob" />

      <div className="balance-hero-top">
        <div>
          <p className="balance-hero-label">{account.type}</p>
          <p className="balance-hero-scheme">{account.scheme}</p>
        </div>
        <button
          type="button"
          className="balance-hero-toggle"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide balance" : "Show balance"}
        >
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <p className="balance-hero-amount">
        {revealed ? formatCurrency(account.balance) : "₹ •••••••"}
      </p>

      <p className="balance-hero-number">
        {revealed ? account.number : maskAccountNumber(account.number)}
      </p>

      <div className="balance-hero-actions">
        <Link to="/transfer" className="balance-hero-btn primary">
          <ArrowLeftRight size={15} /> Transfer
        </Link>
        <Link to="/transactions" className="balance-hero-btn ghost">
          <FileText size={15} /> Statement
        </Link>
      </div>
    </div>
  );
}