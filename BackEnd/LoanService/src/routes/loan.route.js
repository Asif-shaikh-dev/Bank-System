import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validateLoanApplication, handleValidationErrors } from "../middleware/loan.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
    listLoanTypes,
    applyForLoan,
    getMyLoanApplications,
    getLoanApplicationDetails,
} from "../controllers/createLoan.controller.js";

const router = express.Router();

// Public — loan_types is reference data (rates, min/max amounts), no
// auth needed to browse it, same as visiting the marketing pages in
// Dashboard.jsx's PRODUCT_CATALOG before logging in.
router.get("/types", listLoanTypes);

// Everything below requires a logged-in user.
router.use(verifyToken);

router.post(
    "/apply",
    upload.fields([
        { name: "income_proof", maxCount: 1 },
        { name: "identity_proof", maxCount: 1 },
        { name: "collateral_proof", maxCount: 1 },
    ]),
    validateLoanApplication,
    handleValidationErrors,
    applyForLoan
);

router.get("/my-applications", getMyLoanApplications);
router.get("/application/:id", getLoanApplicationDetails);

export default router;