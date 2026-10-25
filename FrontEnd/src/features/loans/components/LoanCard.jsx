import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getIconForLoanType, getSlugForLoanType } from "../loanSections";
//this is loan card component which is used to display the loan details in the loan page
function formatAmount(value) {
  const num = Number(value);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function LoanCard({ loanType }) {
  const Icon = getIconForLoanType(loanType.name);
  const slug = getSlugForLoanType(loanType.name);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#0F2440]/5 text-[#0F2440]">
        <Icon size={20} />
      </span>

      <h3 className="text-sm font-semibold text-[#0F2440]">{loanType.name}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {loanType.category === "SECURED" ? "Secured" : "Unsecured"} ·{" "}
        {loanType.requires_collateral ? "Collateral required" : "No collateral"}
      </p>

      <dl className="mt-4 space-y-1.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <dt>Amount</dt>
          <dd className="font-medium text-[#0F2440]">
            {formatAmount(loanType.min_amount)} – {formatAmount(loanType.max_amount)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Tenure</dt>
          <dd className="font-medium text-[#0F2440]">
            {loanType.min_tenure_months} – {loanType.max_tenure_months} months
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Rate from</dt>
          <dd className="font-medium text-[#0F2440]">{loanType.base_interest_rate}% p.a.</dd>
        </div>
      </dl>

      <Link
        to={`/loans/${slug}/apply`}
        className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#0F2440] px-4 py-2 text-xs font-medium text-white"
      >
        Apply now <ArrowRight size={13} />
      </Link>
    </div>
  );
}