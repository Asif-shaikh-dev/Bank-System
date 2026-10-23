import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../../components/common/Navbar";
import { Upload, Check, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import loanApi from "../loan.api";
import { findLoanTypeBySlug } from "../loanSections";

const EMPLOYMENT_TYPE_OPTIONS = ["Salaried", "Self-Employed", "Business Owner", "Retired"];

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-sm font-medium text-[#0F2440]">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function TextField({ label, name, value, onChange, error, type = "text", placeholder, full = false, ...rest }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="block text-sm text-slate-600">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1.5 w-full rounded-md border px-3 py-2 text-sm text-[#0F2440] outline-none focus:ring-2 focus:ring-[#0F2440]/20 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function TextareaField({ label, name, value, onChange, error, full = true }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="block text-sm text-slate-600">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        value={value}
        onChange={onChange}
        className={`mt-1.5 w-full rounded-md border px-3 py-2 text-sm text-[#0F2440] outline-none focus:ring-2 focus:ring-[#0F2440]/20 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, error, options, placeholder = "Select an option" }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-slate-600">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1.5 w-full rounded-md border px-3 py-2 text-sm text-[#0F2440] outline-none focus:ring-2 focus:ring-[#0F2440]/20 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function FileUploadField({ label, name, fileState, onChange, error }) {
  return (
    <div>
      <label className="block text-sm text-slate-600">{label}</label>
      <label
        htmlFor={name}
        className={`mt-1.5 flex cursor-pointer items-center gap-3 rounded-md border border-dashed px-3 py-3 text-sm ${
          error ? "border-red-400" : "border-slate-300"
        }`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded bg-slate-50 text-slate-400">
          <Upload className="h-4 w-4" />
        </span>
        <span className="text-slate-500">
          {fileState ? (
            <span className="flex items-center gap-1 text-[#0F2440]">
              <Check className="h-3.5 w-3.5" /> {fileState.name}
            </span>
          ) : (
            "Upload a JPG, PNG or PDF (max 5MB)"
          )}
        </span>
        <input id={name} name={name} type="file" accept="image/*,.pdf" onChange={onChange} className="hidden" />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ApplyLoan() {
  // Route is /loans/:sectionId/apply, sectionId being one of Navbar's
  // slugs (home-loan, personal-loan, car-loan, education-loan) or the
  // slugified name of any other loan_types row from Loans.jsx's cards.
  const { sectionId } = useParams();

  const [loanType, setLoanType] = useState(null);
  const [isLoadingType, setIsLoadingType] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    employmentType: "",
    requestedAmount: "",
    tenureMonths: "",
    purpose: "",
    monthlyIncome: "",
    collateralDescription: "",
  });

  const [files, setFiles] = useState({
    incomeProof: null,
    identityProof: null,
    collateralProof: null,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLoanType() {
      setIsLoadingType(true);
      try {
        const res = await loanApi.getLoanTypes();
        const match = findLoanTypeBySlug(sectionId, res.data || []);
        if (cancelled) return;

        if (!match) {
          setNotFound(true);
        } else {
          setLoanType(match);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error("Couldn't load this loan product. Please try again.");
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setIsLoadingType(false);
      }
    }

    loadLoanType();
    return () => {
      cancelled = true;
    };
  }, [sectionId]);

  function updateField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleChange(e) {
    updateField(e.target.name, e.target.value);
  }

  function handleFileChange(key) {
    return (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Matches upload.middleware.js's fileFilter: jpeg|jpg|png|pdf, 5MB limit
      const allowedTypes = /\.(jpe?g|png|pdf)$/i;
      if (!allowedTypes.test(file.name)) {
        setErrors((prev) => ({ ...prev, [key]: "Only JPG, PNG or PDF files are allowed" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [key]: "File must be under 5MB" }));
        return;
      }

      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setFiles((prev) => ({ ...prev, [key]: file }));
    };
  }

  function validate() {
    const next = {};
    const amount = parseFloat(formData.requestedAmount);
    const tenure = parseInt(formData.tenureMonths, 10);
    const income = parseFloat(formData.monthlyIncome);

    if (!formData.employmentType) next.employmentType = "Select your employment type";

    if (!formData.requestedAmount || isNaN(amount) || amount <= 0) {
      next.requestedAmount = "Enter the amount you'd like to borrow";
    } else if (loanType && (amount < Number(loanType.min_amount) || amount > Number(loanType.max_amount))) {
      next.requestedAmount = `Must be between ₹${Number(loanType.min_amount).toLocaleString(
        "en-IN"
      )} and ₹${Number(loanType.max_amount).toLocaleString("en-IN")}`;
    }

    if (!formData.tenureMonths || isNaN(tenure) || tenure <= 0) {
      next.tenureMonths = "Enter a tenure in months";
    } else if (loanType && (tenure < loanType.min_tenure_months || tenure > loanType.max_tenure_months)) {
      next.tenureMonths = `Must be between ${loanType.min_tenure_months} and ${loanType.max_tenure_months} months`;
    }

    if (!formData.purpose.trim()) next.purpose = "Tell us what this loan is for";

    if (!formData.monthlyIncome || isNaN(income) || income <= 0) {
      next.monthlyIncome = "Enter your monthly income";
    }

    if (loanType?.requires_collateral && !formData.collateralDescription.trim()) {
      next.collateralDescription = `${loanType.name} requires collateral details`;
    }

    if (!files.incomeProof) next.incomeProof = "Upload proof of income";
    if (!files.identityProof) next.identityProof = "Upload proof of identity";
    if (loanType?.requires_collateral && !files.collateralProof) {
      next.collateralProof = "Upload collateral documents";
    }

    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!loanType) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("loan_type_id", loanType.id);
      fd.append("employment_type", formData.employmentType);
      fd.append("requested_amount", formData.requestedAmount);
      fd.append("tenure_months", formData.tenureMonths);
      fd.append("purpose", formData.purpose);
      fd.append("monthly_income", formData.monthlyIncome);
      if (loanType.requires_collateral) {
        fd.append("collateral_description", formData.collateralDescription);
      }

      // Field names here MUST match loan.route.js's upload.fields([...]) config
      fd.append("income_proof", files.incomeProof);
      fd.append("identity_proof", files.identityProof);
      if (files.collateralProof) {
        fd.append("collateral_proof", files.collateralProof);
      }

      const data = await loanApi.applyForLoan(fd);

      if (!data.success) {
        throw new Error(data.message || "Something went wrong submitting your application.");
      }

      setSubmissionResult(data.data);
      setSubmitted(true);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Submission failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingType) {
    return (
      <div className="min-h-screen bg-[#F7F5F1]">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading loan details...
        </div>
      </div>
    );
  }

  if (notFound || !loanType) {
    return (
      <div className="min-h-screen bg-[#F7F5F1]">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-sm text-slate-500">
            We couldn't find that loan product. It may have been renamed or retired.
          </p>
          <Link to="/loans" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#0F2440]">
            <ArrowLeft size={14} /> Back to all loans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F1]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10">
          <Link to="/loans" className="mb-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowLeft size={13} /> All loans
          </Link>
          <h1 className="font-serif text-3xl text-[#0F2440]">Apply for {loanType.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {loanType.base_interest_rate}% p.a. onwards ·{" "}
            {loanType.requires_collateral ? "Requires collateral" : "No collateral needed"}
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1F6F5C]/10">
              <Check className="h-5 w-5 text-[#1F6F5C]" />
            </div>
            <h2 className="text-base font-medium text-[#0F2440]">Application submitted</h2>
            <p className="mt-1 text-sm text-slate-500">
              Application #{submissionResult?.application_id} is under review.
              {submissionResult?.indicative_emi && (
                <> Your indicative EMI is ₹{Number(submissionResult.indicative_emi).toLocaleString("en-IN")}/month.</>
              )}
            </p>
            <Link to="/loans" className="mt-4 inline-block text-sm font-medium text-[#0F2440]">
              View my applications
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Section title="Loan details">
              <SelectField
                label="Employment type"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                error={errors.employmentType}
                options={EMPLOYMENT_TYPE_OPTIONS}
              />
              <TextField
                label="Monthly income (₹)"
                name="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={handleChange}
                error={errors.monthlyIncome}
                placeholder="75000"
              />
              <TextField
                label={`Amount requested (₹${Number(loanType.min_amount).toLocaleString(
                  "en-IN"
                )} – ₹${Number(loanType.max_amount).toLocaleString("en-IN")})`}
                name="requestedAmount"
                type="number"
                value={formData.requestedAmount}
                onChange={handleChange}
                error={errors.requestedAmount}
                placeholder="500000"
              />
              <TextField
                label={`Tenure in months (${loanType.min_tenure_months}–${loanType.max_tenure_months})`}
                name="tenureMonths"
                type="number"
                value={formData.tenureMonths}
                onChange={handleChange}
                error={errors.tenureMonths}
                placeholder="36"
              />
              <TextareaField
                label="Purpose of loan"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                error={errors.purpose}
              />
              {loanType.requires_collateral && (
                <TextareaField
                  label="Collateral description"
                  name="collateralDescription"
                  value={formData.collateralDescription}
                  onChange={handleChange}
                  error={errors.collateralDescription}
                />
              )}
            </Section>

            <Section title="Documents">
              <FileUploadField
                label="Proof of income"
                name="incomeProof"
                fileState={files.incomeProof}
                onChange={handleFileChange("incomeProof")}
                error={errors.incomeProof}
              />
              <FileUploadField
                label="Proof of identity"
                name="identityProof"
                fileState={files.identityProof}
                onChange={handleFileChange("identityProof")}
                error={errors.identityProof}
              />
              {loanType.requires_collateral && (
                <FileUploadField
                  label="Collateral documents"
                  name="collateralProof"
                  fileState={files.collateralProof}
                  onChange={handleFileChange("collateralProof")}
                  error={errors.collateralProof}
                />
              )}
            </Section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0F2440] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}