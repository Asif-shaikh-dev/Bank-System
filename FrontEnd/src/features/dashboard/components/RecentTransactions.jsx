import React from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";

export default function RecentTransactions({ transactions = [] }) {
  return (
    <div className="db-panel">
      <div className="db-panel-header">
        <div>
          <h2>Recent transactions</h2>
          <p className="sub">Your latest account activity</p>
        </div>
        <Link to="/transactions" className="db-panel-link">
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="db-empty-note">No transactions yet.</p>
      ) : (
        <div className="txn-list">
          {transactions.map((txn) => (
            <div key={txn.id} className="txn-row">
              <span className={`txn-icon ${txn.type}`}>
                {txn.type === "credit" ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
              </span>
              <div className="txn-info">
                <p className="txn-desc">{txn.description}</p>
                <p className="txn-date">{txn.date}</p>
              </div>
              <p className={`txn-amount ${txn.type}`}>
                {txn.type === "credit" ? "+" : "−"}{formatCurrency(txn.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}