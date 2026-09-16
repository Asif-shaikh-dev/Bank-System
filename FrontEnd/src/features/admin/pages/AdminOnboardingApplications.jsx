import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, XCircle, Loader2, Inbox, FileText } from "lucide-react";
import {
  getPendingOnboardingApplications,
  approveOnboardingApplication,
  rejectOnboardingApplication,
  ACCOUNT_SERVICE_ORIGIN,
} from "../admin.api";
import { useAdmin } from "../AdminContext";
import DocumentViewerModal from "../components/DocumentViewerModal";

const RISK_LABEL = { 0: "Low", 1: "Medium", 2: "High" };

export default function AdminOnboardingApplications() {
  const { updateStats } = useAdmin();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [viewingApp, setViewingApp] = useState(null); // { name, documents }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data } = await getPendingOnboardingApplications();
        if (!cancelled) {
          const list = data.data || [];
          setApplications(list);
          updateStats({ pendingOnboarding: list.length });
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load onboarding applications.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [updateStats]);

  const handleDecision = async (id, action) => {
    setActioningId(id);
    try {
      if (action === "approve") {
        await approveOnboardingApplication(id);
        toast.success("Application approved. Account created.");
      } else {
        await rejectOnboardingApplication(id);
        toast.success("Application rejected.");
      }
      setApplications((prev) => {
        const next = prev.filter((app) => app.id !== id);
        updateStats({ pendingOnboarding: next.length });
        return next;
      });
    } catch (err) {
      console.error(err);
      toast.error(`Could not ${action} this application.`);
    } finally {
      setActioningId(null);
    }
  };

  const openDocuments = (app) => {
    const toFullUrl = (relativeUrl) =>
      relativeUrl ? `${ACCOUNT_SERVICE_ORIGIN}${relativeUrl}` : null;

    setViewingApp({
      name: app.name,
      documents: [
        { label: "Proof of Identity", url: toFullUrl(app.proof_of_identity_url) },
        { label: "Proof of Address", url: toFullUrl(app.proof_of_address_url) },
        { label: "Passport Photo", url: toFullUrl(app.passport_photo_url) },
      ],
    });
  };

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

        .risk-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
        .risk-badge.risk-0 { background: rgba(30,122,61,0.1); color: #1E7A3D; }
        .risk-badge.risk-1 { background: rgba(230,160,20,0.12); color: #B3811E; }
        .risk-badge.risk-2 { background: rgba(179,38,30,0.1); color: #B3261E; }

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
          .onboarding-table { min-width: 820px; }
        }
      `}</style>

      <div className="onboarding-header">
        <div>
          <h2>Onboarding applications</h2>
          <p className="sub">Accounts flagged for manual compliance review.</p>
        </div>
        <span className="count-pill">{applications.length} pending</span>
      </div>

      {loading ? (
        <div className="onboarding-empty"><Loader2 className="spin" size={22} /> Loading applications…</div>
      ) : applications.length === 0 ? (
        <div className="onboarding-empty"><Inbox size={22} /> No pending applications right now.</div>
      ) : (
        <div className="onboarding-table-wrap">
          <table className="onboarding-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Contact</th>
                <th>PAN / Aadhaar</th>
                <th>Account</th>
                <th>Risk</th>
                <th>Documents</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="applicant-name">{app.name}</div>
                    <div className="applicant-sub">{app.source_of_income}</div>
                  </td>
                  <td>
                    <div>{app.email_id}</div>
                    <div className="applicant-sub">{app.phone_no}</div>
                  </td>
                  <td>
                    <div>{app.pan_card_no}</div>
                    <div className="applicant-sub">{app.aadhaar_no}</div>
                  </td>
                  <td>
                    <div>{app.account_type}</div>
                    <div className="applicant-sub">{app.account_scheme}</div>
                  </td>
                  <td>
                    <span className={`risk-badge risk-${app.risk_score}`}>
                      {RISK_LABEL[app.risk_score] ?? "Unknown"}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn view-docs" onClick={() => openDocuments(app)}>
                      <FileText size={15} /> View
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="action-btn approve"
                        disabled={actioningId === app.id}
                        onClick={() => handleDecision(app.id, "approve")}
                      >
                        <CheckCircle2 size={15} /> Approve
                      </button>
                      <button
                        className="action-btn reject"
                        disabled={actioningId === app.id}
                        onClick={() => handleDecision(app.id, "reject")}
                      >
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