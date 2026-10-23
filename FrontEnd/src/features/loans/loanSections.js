import { Home, IdCard, Car, GraduationCap, Landmark, Coins, Building2 } from "lucide-react";

// Turns a loan_types.name into the same kind of slug Navbar/Modal.jsx
// already uses for the 4 products it knows about ("Home Loan" -> "home-loan").
export const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Navbar's NAV_DATA.loan section ids don't all match slugify(loan_types.name)
// 1:1 — specifically "car-loan" (Navbar) vs "Vehicle Loan" (DB). This maps
// the mismatched ones; anything not listed here falls back to slugify().
const SLUG_ALIASES = {
  "car-loan": "Vehicle Loan",
};

// Icons purely for display — falls back to Landmark for loan_types rows
// that have no icon assigned (Loan Against Property, Business Loan, etc,
// which also have no corresponding Navbar section at all right now).
const ICONS_BY_NAME = {
  "Home Loan": Home,
  "Personal Loan": IdCard,
  "Vehicle Loan": Car,
  "Education Loan": GraduationCap,
  "Gold Loan": Coins,
  "Business Loan": Building2,
};

export const getIconForLoanType = (name) => ICONS_BY_NAME[name] || Landmark;

/**
 * Given the :sectionId route param (e.g. "car-loan") and the list of
 * loan_types fetched from GET /loan/types, finds the matching row.
 * Returns null if nothing matches — caller should show a "loan type
 * not found" state rather than crash.
 */
export const findLoanTypeBySlug = (sectionId, loanTypes) => {
  const aliasName = SLUG_ALIASES[sectionId];
  return (
    loanTypes.find((t) => (aliasName ? t.name === aliasName : slugify(t.name) === sectionId)) ||
    // Fallback in case a slug was aliased above but the alias itself
    // also happens to equal a plain slugify() match for a different row
    loanTypes.find((t) => slugify(t.name) === sectionId) ||
    null
  );
};

// Used by Loans.jsx to build the "Apply" link for each card — inverse
// direction of findLoanTypeBySlug.
export const getSlugForLoanType = (loanTypeName) => {
  const aliasEntry = Object.entries(SLUG_ALIASES).find(([, name]) => name === loanTypeName);
  return aliasEntry ? aliasEntry[0] : slugify(loanTypeName);
};