// routes/loan.route.js
import express from "express";
import { body } from "express-validator";
import { applyForLoan, reviewLoanApplication } from "../controllers/createLoan.controller.js";
import { handleValidationErrors } from "../middleWare/validate.js";
import { verifyJWT, isAdmin } from "../middleWare/auth.middleware.js"; // assumes these exist from the Auth service pattern
import { upload } from "../middleWare/upload.middleware.js";

const loanRouter = express.Router();

loanRouter.post("/apply",
    verifyJWT,
    upload.fields([
        { name: 'aadhaar_card', maxCount: 1 },
        { name: 'pan_card', maxCount: 1 },
        { name: 'salary_slips', maxCount: 3 },
        { name: 'itr_documents', maxCount: 3 },
        { name: 'collateral_document', maxCount: 1 }
    ]),
    body('loan_type_id').isInt().withMessage('loan_type_id must be a valid ID'),
    body('employment_type').isIn(['SALARIED', 'SELF_EMPLOYED']).withMessage('Invalid employment_type'),
    body('requested_amount').isFloat({ gt: 0 }).withMessage('requested_amount must be a positive number'),
    body('tenure_months').isInt({ gt: 0 }).withMessage('tenure_months must be a positive integer'),
    body('monthly_income').isFloat({ gt: 0 }).withMessage('monthly_income must be a positive number'),
    handleValidationErrors,
    applyForLoan
);

// Admin-only review endpoint
loanRouter.post("/review",
    verifyJWT,
    isAdmin,
    body('application_id').isInt().withMessage('application_id is required'),
    body('decision').isIn(['APPROVED', 'REJECTED']).withMessage('decision must be APPROVED or REJECTED'),
    handleValidationErrors,
    reviewLoanApplication
);

export default loanRouter;