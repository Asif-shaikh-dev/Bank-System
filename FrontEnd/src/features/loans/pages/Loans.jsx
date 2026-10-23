import { useEffect, useState } from "react";
import Navbar from "../../../components/common/Navbar";
import LoanCard from "../components/LoanCard";
import loanApi from "../loan.api";
import { useAuth } from "../../../store/AuthContext";
import { Loader2 } from "lucide-react";

const STATUS_STYLES = {
  PENDING_REVIEW: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

const STATUS_LABELS = {
  PENDING_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function Loans() {
  const { isAuthenticated } = useAuth();

  const [loanTypes, setLoanTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLoanTypes() {
      setIsLoadingTypes(true);
      try {
        const res = await loanApi.getLoanTypes();
        if (!cancelled) setLoanTypes(res.data || []);
      } catch (err) {
        if (!cancelled) setError("Couldn't load loan products right now. Please try again shortly.");
      } finally {
        if (!cancelled) setIsLoadingTypes(false);
      }
    }

    loadLoanTypes();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    async function loadApplications() {
      setIsLoadingApps(true);
      try {
        const res = await loanApi.getMyApplications();
        if (!cancelled) setApplications(res.data || []);
      } catch (err) {
        // Common case: user hasn't finished onboarding yet, so there's
        // no `customers` row for them — resolveCustomerId() in LoanService
        // throws a 404 with a clear message in that case. Not a hard
        // error worth surfacing loudly here; just show an empty state.
        if (!cancelled) setApplications([]);
      } finally {
        if (!cancelled) setIsLoadingApps(false);
      }
    }

    loadApplications();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#F7F5F1]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-[#0F2440]">Loans</h1>
          <p className="mt-2 text-sm text-slate-500">
            Pick a loan that fits what you're financing — rates and eligibility below.
          </p>
        </div>

        {isAuthenticated && (
          <div className="mb-12">
            <h2 className="mb-4 text-sm font-medium text-[#0F2440]">Your applications</h2>

            {isLoadingApps ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading your applications...
              </div>
            ) : applications.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
                You haven't applied for a loan yet — pick a product below to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#0F2440]">{app.loan_type_name}</p>
                      <p className="text-xs text-slate-500">
                        ₹{Number(app.requested_amount).toLocaleString("en-IN")} · {app.tenure_months} months
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[app.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <h2 className="mb-4 text-sm font-medium text-[#0F2440]">Available loan products</h2>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {isLoadingTypes ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading loan products...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loanTypes.map((lt) => (
              <LoanCard key={lt.id} loanType={lt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}