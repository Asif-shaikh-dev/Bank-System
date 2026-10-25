import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Inbox } from "lucide-react";
import { getAllTransactions } from "../admin.api";
import AdminTableStyles from "../components/AdminTableStyles";
import TreasuryPanel from "../components/TreasuryPanel";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const when = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminTransactions() {
  const [view, setView] = useState("customers"); // "customers" | "treasury"
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getAllTransactions();
        if (!cancelled) setRows(data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Could not load transactions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (type === "ALL" || r.type === type) &&
        (!q || [r.name, r.email_id, r.account_number, r.description, r.reference].some((v) => String(v || "").toLowerCase().includes(q)))
    );
  }, [rows, type, query]);

  const credits = filtered.filter((r) => r.type === "CREDIT").reduce((s, r) => s + Number(r.amount), 0);
  const debits = filtered.filter((r) => r.type === "DEBIT").reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="onboarding-page">
      <AdminTableStyles />

      <div className="toolbar">
        <button className={`filter-btn${view === "customers" ? " is-active" : ""}`} onClick={() => setView("customers")}>
          Customer transactions
        </button>
        <button className={`filter-btn${view === "treasury" ? " is-active" : ""}`} onClick={() => setView("treasury")}>
          Bank treasury
        </button>
      </div>

      {view === "treasury" ? (
        <TreasuryPanel />
      ) : (
        <>
          <div className="onboarding-header">
            <div>
              <h2>Transactions</h2>
              <p className="sub">Latest 300 ledger entries across all accounts (money added, loan disbursements, EMIs).</p>
            </div>
            <div className="pill-row">
              <span className="count-pill">In {inr(credits)}</span>
              <span className="count-pill">Out {inr(debits)}</span>
            </div>
          </div>

          <div className="toolbar">
            <input placeholder="Search name, account, reference…" value={query} onChange={(e) => setQuery(e.target.value)} />
            {["ALL", "CREDIT", "DEBIT"].map((t) => (
              <button key={t} className={`filter-btn${type === t ? " is-active" : ""}`} onClick={() => setType(t)}>
                {t === "ALL" ? "All" : t === "CREDIT" ? "Credits" : "Debits"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="onboarding-empty"><Loader2 className="spin" size={22} /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="onboarding-empty"><Inbox size={22} /> No transactions yet.</div>
          ) : (
            <div className="onboarding-table-wrap">
              <table className="onboarding-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Account holder</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance after</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>{when(r.created_at)}</td>
                      <td>
                        <div className="applicant-name">{r.name}</div>
                        <div className="applicant-sub">{r.account_number}</div>
                      </td>
                      <td>
                        <div>{r.description}</div>
                        <div className="applicant-sub">{r.reference}</div>
                      </td>
                      <td>
                        <span className={`type-badge ${r.type === "CREDIT" ? "credit" : "debit"}`}>{r.type}</span>
                      </td>
                      <td className={r.type === "CREDIT" ? "amount-credit" : "amount-debit"}>
                        {r.type === "CREDIT" ? "+" : "−"}{inr(r.amount)}
                      </td>
                      <td>{inr(r.balance_after)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}