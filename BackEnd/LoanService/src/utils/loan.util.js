import { getCustomerByUserId } from "../models/Loan.model.js";

/**
 * Resolves a customer_id from the JWT payload attached to req.user.
 * ASSUMPTION (flagged in auth.middleware.js too): req.user.id is the
 * users.id column. If your JWT payload uses a different key
 * (e.g. req.user.userId or req.user.sub), change the destructure below.
 */
export const resolveCustomerId = async (reqUser) => {
    const userId = reqUser?.id;
    if (!userId) {
        throw new Error("Token payload did not contain a user id (expected req.user.id).");
    }

    const customer = await getCustomerByUserId(userId);
    if (!customer) {
        // This happens if the user hasn't completed onboarding yet —
        // customers rows only get created once an onboarding application
        // is APPROVED (see AccountService's onboarding.controller.js).
        throw new Error("No customer record found for this user. Complete account onboarding first.");
    }
    return customer.id;
};

/**
 * Validates the requested amount/tenure against the chosen loan_type's
 * min/max bounds from loan_types.
 */
export const validateAgainstLoanType = (loanType, requestedAmount, tenureMonths) => {
    const errors = [];

    if (requestedAmount < Number(loanType.min_amount) || requestedAmount > Number(loanType.max_amount)) {
        errors.push(
            `requested_amount must be between ${loanType.min_amount} and ${loanType.max_amount} for ${loanType.name}.`
        );
    }

    if (tenureMonths < loanType.min_tenure_months || tenureMonths > loanType.max_tenure_months) {
        errors.push(
            `tenure_months must be between ${loanType.min_tenure_months} and ${loanType.max_tenure_months} for ${loanType.name}.`
        );
    }

    return errors;
};

/**
 * Standard reducing-balance EMI formula, used only to show the applicant
 * an indicative EMI at application time. The DB doesn't store an EMI on
 * loan_applications (only on loans, post-approval), so this is
 * calculate-and-return, not calculate-and-persist.
 */
export const calculateIndicativeEmi = (principal, annualRatePercent, tenureMonths) => {
    const monthlyRate = annualRatePercent / 12 / 100;
    if (monthlyRate === 0) return principal / tenureMonths;

    const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    return Math.round(emi * 100) / 100;
};