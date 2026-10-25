import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, XCircle, Loader2, Inbox, FileText } from "lucide-react";
import {
  getPendingLoanApplications,
  approveLoanApplication,
  rejectLoanApplication,
  LOAN_SERVICE_ORIGIN,
} from "../admin.api";
import { useAdmin } from "../AdminContext";
import DocumentViewerModal from "../components/DocumentViewerModal";

const DOC_LABELS = {
  SALARY_SLIP: "Salary slip",
  ITR: "Income tax return",
  PAN_POI: "PAN (identity)",
  AADHAAR_POA: "Aadhaar",
  COLLATERAL_PROOF: "Collateral documents",
};
const EMPLOYMENT_LABELS = {
  SALARIED: "Salaried",
  SELF_EMPLOYED: "Self-employed",
  BUSINESS_OWNER: "Business owner",
  RETIRED: "Retired",
};
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function AdminLoanApplications() {
  const { updateStats } = useAdmin();
  const [applications, setApplications] = useState([]);
  const [rates, setRates] = useState({}); // id -> edited interest rate
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await getPendingLoanApplications();
        if (!cancelled) {
          const list = data.data || [];
          setApplications(list);
          setRates(Object.fromEntries(list.map((a) => [a.id, a.base_interest_rate ?? 7])));
          updateStats({ pendingLoanApplications: list.length });
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load loan applications.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [updateStats]);

  const removeApp = (id) =>
    setApplications((prev) => {
      const next = prev.filter((a) => a.id !== id);
      updateStats({ pendingLoanApplications: next.length });
      return next;
    });

  const handleApprove = async (app) => {
    const rate = rates[app.id];
    if (!window.confirm(`Approve ${inr(app.requested_amount)} for ${app.name} at ${rate}% p.a.? The amount will be credited to their account.`)) return;
    setActioningId(app.id);
    try {
      const { data } = await approveLoanApplication(app.id, rate);
      toast.success(`Loan disbursed. EMI ${inr(data.data.emi_amount)}/month.`);
      removeApp(app.id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not approve this application.");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (app) => {
    const reason = window.prompt(`Reason for rejecting ${app.name}'s application:`);
    if (!reason || !reason.trim()) return;
    setActioningId(app.id);
    try {
      await rejectLoanApplication(app.id, reason.trim());
      toast.success("Application rejected.");
      removeApp(app.id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reject this application.");
    } finally {
      setActioningId(null);
    }
  };

  const openDocuments = (app) =>
    setViewingApp({
      name: app.name,
      documents: (app.documents || []).map((d) => ({
        label: DOC_LABELS[d.type] || d.type,
        url: d.path ? `${LOAN_SERVICE_ORIGIN}/${d.path}` : null,
      })),
    });

  return (
    <div className="onboarding-page">
      <style>{`
        .onboarding-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .onboarding-header h2 { margin: 0 0 4px; font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; font-size: 1.3rem; color: var(--ink-text); }
        .onboarding-header .sub { margin: 0; font-size: 12.5px; color: var(--muted); }
        .count-pill { background: rgba(255,107,74,0.1); color: #E24E2C; font-size: 12.5px; font-weight: 700; padding: 5px 14px; border-radius: 999px; }
        .onboarding-empty { display: flex; align-items: center; gap: 10px; padding: 48px 0; justify-content: center; color: var(--muted); font-size: 14px; background: #fff; border: 1px solid var(--border); border-radius: 16px; }
        .spin { animation: spin 900ms linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .onboarding-table-wrap { background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .onboarding-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .onboarding-table th { text-align: left; padding: 12px 16px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--muted); background: var(--paper); border-bottom: 1px solid var(--border); }
        .onboarding-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: top; color: var(--ink-text); }
        .onboarding-table tr:last-child td { border-bottom: none; }
        .applicant-name { font-weight: 600; }
        .applicant-sub { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
        .rate-input { width: 70px; padding: 6px 8px; border: 1px solid var(--border); border-radius: 8px; font: inherit; font-size: 13px; color: var(--ink-text); }
        .row-actions { display: flex; gap: 8px; }
        .action-btn { display: flex; align-items: center; gap: 5px; border: none; border-radius: 8px; padding: 7px 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 150ms ease, background 150ms ease; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .action-btn.approve { background: rgba(30,122,61,0.1); color: #1E7A3D; }
        .action-btn.approve:hover:not(:disabled) { background: rgba(30,122,61,0.18); }
        .action-btn.reject { background: rgba(179,38,30,0.1); color: #B3261E; }
        .action-btn.reject:hover:not(:disabled) { background: rgba(179,38,30,0.18); }
        .action-btn.view-docs { background: rgba(11,43,38,0.06); color: var(--ink); }
        .action-btn.view-docs:hover:not(:disabled) { background: rgba(11,43,38,0.12); }
        @media (max-width: 900px) {
          .onboarding-table-wrap { overflow-x: auto; }
          .onboarding-table { min-width: 980px; }
        }
      `}</style>

      <div className="onboarding-header">
        <div>
          <h2>Loan applications</h2>
          <p className="sub">Review, set the interest rate, and disburse.</p>
        </div>
        <span className="count-pill">{applications.length} pending</span>
      </div>

      {loading ? (
        <div className="onboarding-empty"><Loader2 className="spin" size={22} /> Loading applications…</div>
      ) : applications.length === 0 ? (
        <div className="onboarding-empty"><Inbox size={22} /> No pending loan applications.</div>
      ) : (
        <div className="onboarding-table-wrap">
          <table className="onboarding-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Loan</th>
                <th>Income</th>
                <th>Rate (% p.a.)</th>
                <th>Documents</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="applicant-name">{app.name}</div>
                    <div className="applicant-sub">{app.email_id}</div>
                    <div className="applicant-sub">{app.phone_no}</div>
                  </td>
                  <td>
                    <div className="applicant-name">{app.loan_type_name}</div>
                    <div>{inr(app.requested_amount)} · {app.tenure_months} months</div>
                    <div className="applicant-sub">{app.purpose}</div>
                  </td>
                  <td>
                    <div>{inr(app.monthly_income)}/month</div>
                    <div className="applicant-sub">{EMPLOYMENT_LABELS[app.employment_type] || app.employment_type}</div>
                  </td>
                  <td>
                    <input
                      className="rate-input"
                      type="number"
                      step="0.05"
                      min="0"
                      value={rates[app.id] ?? ""}
                      onChange={(e) => setRates((p) => ({ ...p, [app.id]: e.target.value }))}
                    />
                  </td>
                  <td>
                    <button className="action-btn view-docs" onClick={() => openDocuments(app)}>
                      <FileText size={15} /> View
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="action-btn approve" disabled={actioningId === app.id} onClick={() => handleApprove(app)}>
                        <CheckCircle2 size={15} /> Approve
                      </button>
                      <button className="action-btn reject" disabled={actioningId === app.id} onClick={() => handleReject(app)}>
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewingApp && (
        <DocumentViewerModal
          applicant={viewingApp.name}
          documents={viewingApp.documents}
          onClose={() => setViewingApp(null)}
        />
      )}
    </div>
  );
}