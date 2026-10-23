import { body, validationResult } from "express-validator";

// Validation rules for POST /loan/apply.
// Mirrors AccountService's onboarding.controller.js pattern of checking
// required fields up front, but done here via express-validator (which
// was already in your package.json but never actually wired up).
export const validateLoanApplication = [
    body("loan_type_id")
        .notEmpty().withMessage("loan_type_id is required")
        .isInt({ min: 1 }).withMessage("loan_type_id must be a positive integer"),

    body("employment_type")
        .notEmpty().withMessage("employment_type is required")
        .isString(),

    body("requested_amount")
        .notEmpty().withMessage("requested_amount is required")
        .isFloat({ gt: 0 }).withMessage("requested_amount must be a positive number"),

    body("tenure_months")
        .notEmpty().withMessage("tenure_months is required")
        .isInt({ min: 1 }).withMessage("tenure_months must be a positive integer"),

    body("purpose")
        .notEmpty().withMessage("purpose is required")
        .isString(),

    body("monthly_income")
        .notEmpty().withMessage("monthly_income is required")
        .isFloat({ gt: 0 }).withMessage("monthly_income must be a positive number"),

    // Only required when loan_types.requires_collateral = true for the
    // chosen loan_type_id — that's a DB-dependent check, so it can't be
    // expressed as a static express-validator rule. It's enforced in
    // the controller instead, after loan_type is fetched.
    body("collateral_description").optional().isString(),
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};