import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
// import { getTreasury, runEmiCollection } from "../admin.api";
import { getTreasury, runEmiCollection, getEmiInterval, setEmiIntervalApi } from "../admin.api";
import { useAdmin } from "../AdminContext";
import AdminTableStyles from "./AdminTableStyles";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const when = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const LABELS = { INITIAL: "Opening balance", LOAN_DISBURSEMENT: "Loan disbursed", EMI_PRINCIPAL: "EMI principal", EMI_INTEREST: "EMI interest" };

export default function TreasuryPanel() {
  const { updateStats } = useAdmin();
  const [data, setData] = useState(null);
  const [asOf, setAsOf] = useState("");
  const [busy, setBusy] = useState(false);
  const [secs, setSecs] = useState(0);
const [secsInput, setSecsInput] = useState("");

  const load = async () => {
    try {
      const res = await getTreasury();
      setData(res.data.data);
      updateStats({ bankBudget: res.data.data.balance });
    } catch (err) {
      console.error(err);
      toast.error("Could not load the treasury.");
    }
  };
  useEffect(() => {
    load();
    getEmiInterval()
      .then((r) => { setSecs(r.data.data.seconds); setSecsInput(String(r.data.data.seconds)); })
      .catch(() => {});
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);
  
  const applyInterval = async () => {
    try {
      const { data: res } = await setEmiIntervalApi(Number(secsInput));
      setSecs(res.data.seconds);
      toast.success(res.data.seconds ? `EMIs now collected every ${res.data.seconds}s.` : "Back to real monthly collection.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change the interval.");
    }
  };

  const collect = async () => {
    const msg = asOf
      ? `Collect all EMIs due on or before ${asOf}? This simulates that date.`
      : "Collect all EMIs that are due today or earlier?";
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      const { data: res } = await runEmiCollection(asOf);
      const s = res.data;
      toast.success(`Collected ${s.collected} EMIs (${inr(s.total_collected)}, interest ${inr(s.interest_earned)}). ${s.overdue} overdue.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "EMI collection failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <div className="onboarding-empty"><Loader2 className="spin" size={22} /> Loading…</div>;

  const cards = [
    ["Treasury balance", data.balance],
    ["Loans disbursed", data.loans_disbursed],
    ["Principal recovered", data.principal_recovered],
    ["Interest earned", data.interest_earned],
    ["Outstanding principal", data.outstanding_principal],
  ];

  return (
    <div>
      <AdminTableStyles />
      <style>{`
        .treasury-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-bottom: 18px; }
        .treasury-card { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; }
        .treasury-card p { margin: 0 0 6px; font-size: 12px; color: var(--muted); font-weight: 500; }
        .treasury-card strong { font-size: 18px; color: var(--ink-text); }
        .treasury-card.main strong { color: #E24E2C; }
      `}</style>

      <div className="treasury-cards">
        {cards.map(([label, value], i) => (
          <div key={label} className={`treasury-card${i === 0 ? " main" : ""}`}>
            <p>{label}</p>
            <strong>{inr(value)}</strong>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} style={{ flex: "0 0 auto", minWidth: 0 }} title="Leave empty for today" />
        <button className="primary-btn" disabled={busy} onClick={collect}>
          {busy ? "Collecting…" : asOf ? "Collect EMIs (simulate date)" : "Collect due EMIs"}
        </button>
        <span className="applicant-sub">Pick a future date to simulate a month passing.</span>
      </div>

      <div className="toolbar">
  <span className="applicant-name">EMI interval (seconds)</span>
  <input
    type="number"
    min="0"
    value={secsInput}
    onChange={(e) => setSecsInput(e.target.value)}
    style={{ flex: "0 0 110px", minWidth: 0 }}
  />
  <button className="primary-btn" onClick={applyInterval}>Apply</button>
  <span className="applicant-sub">
    {secs > 0 ? `Demo mode: one EMI per loan every ${secs}s.` : "Real mode: EMIs collected on their due dates. Enter 0 for this."}
  </span>
</div>

      <div className="onboarding-table-wrap">
        <table className="onboarding-table">
          <thead>
            <tr><th>Date</th><th>Entry</th><th>Reference</th><th>Amount</th><th>Balance after</th></tr>
          </thead>
          <tbody>
            {data.ledger.map((r) => (
              <tr key={r.id}>
                <td>{when(r.created_at)}</td>
                <td>
                  <div className="applicant-name">{LABELS[r.type] || r.type}</div>
                  <div className="applicant-sub">{r.description}</div>
                </td>
                <td>{r.reference}</td>
                <td className={Number(r.amount) >= 0 ? "amount-credit" : "amount-debit"}>
                  {Number(r.amount) >= 0 ? "+" : "−"}{inr(Math.abs(r.amount))}
                </td>
                <td>{r.balance_after != null ? inr(r.balance_after) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}