import { useState } from "react";
import Navbar from "../../../components/common/Navbar";
import { useAccount } from "../../accounts/AccountContext";
import { Upload, Check } from "lucide-react";
import { toast } from "react-toastify";
import accountApi from "../account.api";

const EMPLOYMENT_STATUS_OPTIONS = [
  "Employed",
  "Self-Employed",
  "Unemployed",
  "Student",
  "Retired",
];

const SOURCE_OF_INCOME_OPTIONS = [
  "Salary",
  "Business",
  "Investments",
  "Pension",
  "Rental Income",
  "Other",
];

const ACCOUNT_SCHEME_OPTIONS = {
  SAVINGS: [
    "Regular Savings Account",
    "Women Savings Account",
    "Senior Citizen Savings Account",
    "Salary Savings Account",
  ],
  CURRENT: ["Regular Current Account", "Business Current Account"],
  SALARY: [
    "Premium Salary Account",
    "Classic Salary Account",
    "Defence Salary Account",
    "Government Salary Account",
  ],
  FIXED_DEPOSIT: [
    "Regular Fixed Deposit",
    "Tax Saving Fixed Deposit",
    "Senior Citizen FD",
    "Recurring Deposit",
  ],
  RD: ["Standard SDP", "Flexi SDP", "Junior SDP"],
};

const ACCOUNT_TYPE_LABELS = {
  SAVINGS: "Savings Account",
  CURRENT: "Current Account",
  SALARY: "Salary Account",
  FIXED_DEPOSIT: "Fixed Deposit",
  RD: "Recurring Deposit",
};

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-sm font-medium text-[#0F2440]">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  maxLength,
  full = false,
  ...rest
}) {
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
        maxLength={maxLength}
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

function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options,
  disabled = false,
  placeholder = "Select an option",
}) {
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
        disabled={disabled}
        className={`mt-1.5 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F2440]/20 ${
          error ? "border-red-400" : "border-slate-200"
        } ${disabled ? "bg-slate-50 text-slate-400" : "text-[#0F2440]"}`}
      >
        {!disabled && <option value="">{placeholder}</option>}
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
        {fileState.preview ? (
          <img
            src={fileState.preview}
            alt={`${label} preview`}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded bg-slate-50 text-slate-400">
            <Upload className="h-4 w-4" />
          </span>
        )}
        <span className="text-slate-500">
          {fileState.file ? (
            <span className="flex items-center gap-1 text-[#0F2440]">
              <Check className="h-3.5 w-3.5" /> {fileState.file.name}
            </span>
          ) : (
            "Upload an image (max 5MB)"
          )}
        </span>
        <input
          id={name}
          name={name}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function OpenAccount() {
  const { accountType, accountScheme, setAccountScheme,setAccountType } = useAccount();

  const schemeOptions = ACCOUNT_SCHEME_OPTIONS[accountType] || [];
  const accountTypeLabel = accountType
    ? ACCOUNT_TYPE_LABELS[accountType] || accountType
    : "";

  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  })();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    pan: "",
    address: "",
    employmentStatus: "",
    sourceOfIncome: "",
    phone: "",
    aadhaar: "",
    accountScheme: accountScheme || "",
  });

  const [files, setFiles] = useState({
    identityProof: { file: null, preview: null },
    addressProof: { file: null, preview: null },
    photo: { file: null, preview: null },
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const { name, value } = e.target;
    updateField(name, value);
  }

  function handlePhoneChange(e) {
    updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10));
  }

  function handleAadhaarChange(e) {
    updateField("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12));
  }

  function handlePanChange(e) {
    updateField("pan", e.target.value.toUpperCase().slice(0, 10));
  }

  function handleSchemeChange(e) {
    updateField("accountScheme", e.target.value);
    setAccountScheme(e.target.value); // keep the global selection in sync
  }

  function handleTypeChange(e) {
    // the dropdown shows labels; the context stores keys like "SAVINGS"
    const key =
      Object.keys(ACCOUNT_TYPE_LABELS).find(
        (k) => ACCOUNT_TYPE_LABELS[k] === e.target.value
      ) ?? null;
  
    setAccountType(key);
    setAccountScheme(null);          // old scheme may not belong to the new type
    updateField("accountScheme", ""); // reset the scheme field
  
    // clear the type error, if any
    setErrors((prev) => {
      const next = { ...prev };
      delete next.accountType;
      return next;
    });
  }


  function handleFileChange(key) {
    return (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, [key]: "Upload an image file" }));
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

      setFiles((prev) => {
        if (prev[key].preview) URL.revokeObjectURL(prev[key].preview);
        return {
          ...prev,
          [key]: { file, preview: URL.createObjectURL(file) },
        };
      });
    };
  }

  function validate() {
    const next = {};

    if (!formData.name.trim()) next.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      next.email = "Enter a valid email address";
    if (!formData.dob) next.dob = "Select your date of birth";
    else if (formData.dob > maxDob)
      next.dob = "You must be at least 18 years old";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan))
      next.pan = "Enter a valid PAN, e.g. ABCDE1234F";
    if (!formData.address.trim())
      next.address = "Enter your residential address";
    if (!formData.employmentStatus)
      next.employmentStatus = "Select your employment status";
    if (!formData.sourceOfIncome)
      next.sourceOfIncome = "Select your source of income";
    if (!/^\d{10}$/.test(formData.phone))
      next.phone = "Enter a valid 10-digit phone number";
    if (!/^\d{12}$/.test(formData.aadhaar))
      next.aadhaar = "Enter a valid 12-digit Aadhaar number";
  
    if (!accountType) next.accountType = "Select an account type";
    if (!formData.accountScheme)
      next.accountScheme = "Select an account scheme";

    if (!files.identityProof.file)
      next.identityProof = "Upload proof of identity";
    if (!files.addressProof.file) next.addressProof = "Upload proof of address";
    if (!files.photo.file) next.photo = "Upload a passport size photo";

    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("name", formData.name);
      fd.append("email_id", formData.email);
      fd.append("date_of_birth", formData.dob);
      fd.append("Pan_card_no", formData.pan);
      fd.append("residential_address", formData.address);
      fd.append("Empoyment_status", formData.employmentStatus);
      fd.append("source_of_income", formData.sourceOfIncome);
      fd.append("phone_no", formData.phone);
      fd.append("aadhaar_no", formData.aadhaar);
      fd.append("account_type", accountType);
      fd.append("account_scheme", formData.accountScheme);

      fd.append("proof_of_identity", files.identityProof.file);
      fd.append("proof_of_address", files.addressProof.file);
      fd.append("passport_size_photo", files.photo.file);

      const data = await accountApi.createAccount(fd); // already response.data

      if (!data.success) {
        throw new Error(
          data.message || "Something went wrong submitting your application."
        );
      }

      setSubmitted(true);
    } catch (err) {
      // axios errors carry the server's JSON body at err.response.data
      const message =
        err.response?.data?.message || err.message || "Submission failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F1]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-[#0F2440]">
            Open a new account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {accountType
              ? `You're opening a ${accountTypeLabel.toLowerCase()}. Fill in your details below.`
              :  "Choose an account type and scheme to get started."}
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1F6F5C]/10">
              <Check className="h-5 w-5 text-[#1F6F5C]" />
            </div>
            <h2 className="text-base font-medium text-[#0F2440]">
              Application submitted
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              We'll verify your documents and get back to you within 2 business
              days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Section title="Personal details">
              <TextField
                label="Full name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter your name"
              />
              <TextField
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
              />
              <TextField
                label="Date of birth"
                name="dob"
                type="date"
                max={maxDob}
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
              />
              <TextField
                label="PAN card number"
                name="pan"
                value={formData.pan}
                onChange={handlePanChange}
                error={errors.pan}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </Section>

            <Section title="Contact & address">
              <TextField
                label="Phone number"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={handlePhoneChange}
                error={errors.phone}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
              <TextField
                label="Aadhaar number"
                name="aadhaar"
                inputMode="numeric"
                value={formData.aadhaar}
                onChange={handleAadhaarChange}
                error={errors.aadhaar}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
              />
              <TextareaField
                label="Residential address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
              />
            </Section>

            <Section title="Employment">
              <SelectField
                label="Employment status"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                error={errors.employmentStatus}
                options={EMPLOYMENT_STATUS_OPTIONS}
              />
              <SelectField
                label="Source of income"
                name="sourceOfIncome"
                value={formData.sourceOfIncome}
                onChange={handleChange}
                error={errors.sourceOfIncome}
                options={SOURCE_OF_INCOME_OPTIONS}
              />
            </Section>

            <Section title="Account details">
  <SelectField
    label="Account type"
    name="accountType"
    value={accountTypeLabel}
    onChange={handleTypeChange}
    error={errors.accountType}
    options={Object.values(ACCOUNT_TYPE_LABELS)}
    placeholder="Select an account type"
  />
  <SelectField
    label="Account scheme"
    name="accountScheme"
    value={formData.accountScheme}
    onChange={handleSchemeChange}
    error={errors.accountScheme}
    options={schemeOptions}
    placeholder="Select a scheme"
  />
</Section>

            <Section title="Documents">
              <FileUploadField
                label="Proof of identity"
                name="identityProof"
                fileState={files.identityProof}
                onChange={handleFileChange("identityProof")}
                error={errors.identityProof}
              />
              <FileUploadField
                label="Proof of address"
                name="addressProof"
                fileState={files.addressProof}
                onChange={handleFileChange("addressProof")}
                error={errors.addressProof}
              />
              <FileUploadField
                label="Passport size photo"
                name="photo"
                fileState={files.photo}
                onChange={handleFileChange("photo")}
                error={errors.photo}
              />
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