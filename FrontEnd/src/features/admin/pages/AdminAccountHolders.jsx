import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Inbox } from "lucide-react";
import { getAccountHolders } from "../admin.api";
import AdminTableStyles from "../components/AdminTableStyles";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function AdminAccountHolders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getAccountHolders();
        if (!cancelled) setRows(data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Could not load account holders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.email_id, r.account_number, r.account_type].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [rows, query]);

  const total = filtered.reduce((sum, r) => sum + Number(r.balance || 0), 0);

  return (
    <div className="onboarding-page">
      <AdminTableStyles />
      <div className="onboarding-header">
        <div>
          <h2>Account holders</h2>
          <p className="sub">Every customer account with its current balance.</p>
        </div>
        <div className="pill-row">
          <span className="count-pill">{filtered.length} accounts</span>
          <span className="count-pill">Total {inr(total)}</span>
        </div>
      </div>

      <div className="toolbar">
        <input placeholder="Search name, email, account number…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="onboarding-empty"><Loader2 className="spin" size={22} /> Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="onboarding-empty"><Inbox size={22} /> No accounts found.</div>
      ) : (
        <div className="onboarding-table-wrap">
          <table className="onboarding-table">
            <thead>
              <tr>
                <th>Holder</th>
                <th>Contact</th>
                <th>Account</th>
                <th>Type</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.account_id}>
                  <td>
                    <div className="applicant-name">{r.name}</div>
                    <div className="applicant-sub">Customer #{r.customer_id}</div>
                  </td>
                  <td>
                    <div>{r.email_id}</div>
                    <div className="applicant-sub">{r.phone_no}</div>
                  </td>
                  <td>{r.account_number}</td>
                  <td>
                    <div>{r.account_type}</div>
                    <div className="applicant-sub">{r.account_scheme}</div>
                  </td>
                  <td className="applicant-name" style={{ color: Number(r.balance) < 0 ? "#B3261E" : undefined }}>
                    {inr(r.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}