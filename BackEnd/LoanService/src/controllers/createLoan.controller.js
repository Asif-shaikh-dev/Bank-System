import { pool } from "../config/db.js";
import {
    getLoanTypeById,
    insertLoanApplication,
    insertLoanDocument,
    getLoanApplicationsByCustomer,
    getLoanApplicationById,
    getAllLoanTypes,
    getDocumentsByApplicationId,
} from "../models/Loan.model.js";
import { resolveCustomerId, validateAgainstLoanType, calculateIndicativeEmi } from "../utils/loan.util.js";

// GET /loan/types — powers the loan-type dropdown/cards on ApplyLoan.jsx
export const listLoanTypes = async (req, res) => {
    try {
        const types = await getAllLoanTypes();
        return res.status(200).json({ success: true, data: types });
    } catch (error) {
        console.error("Error fetching loan types:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch loan types." });
    }
};

// POST /loan/apply
// Expects multipart/form-data (documents attached) — express.json() alone
// won't parse this, hence the upload.middleware.js multer layer in the route.
export const applyForLoan = async (req, res) => {
    const {
        loan_type_id, employment_type, requested_amount, tenure_months,
        purpose, monthly_income, collateral_description,
    } = req.body;

    const client = await pool.connect();

    try {
        const loanTypeId = parseInt(loan_type_id, 10);
        const requestedAmount = parseFloat(requested_amount);
        const tenureMonths = parseInt(tenure_months, 10);

        const loanType = await getLoanTypeById(loanTypeId);
        if (!loanType) {
            return res.status(400).json({ success: false, message: "Invalid or inactive loan_type_id." });
        }

        if (loanType.requires_collateral && !collateral_description) {
            return res.status(400).json({
                success: false,
                message: `${loanType.name} requires collateral_description.`,
            });
        }

        const boundsErrors = validateAgainstLoanType(loanType, requestedAmount, tenureMonths);
        if (boundsErrors.length > 0) {
            return res.status(400).json({ success: false, message: boundsErrors.join(" ") });
        }

        const userId = req.user?.id;
        const customerId = await resolveCustomerId(req.user);

        await client.query("BEGIN");

        const application = await insertLoanApplication(client, {
            userId,
            customerId,
            loanTypeId,
            employmentType: employment_type,
            requestedAmount,
            tenureMonths,
            purpose,
            monthlyIncome: parseFloat(monthly_income),
            collateralDescription: collateral_description,
            status: "PENDING_REVIEW", // Every application starts here; no
            // auto-approve risk-tier logic like onboarding's yet — flag
            // if you want an equivalent accessRisk() step for loans.
        });

        // req.files comes from upload.middleware.js's `.fields([...])`
        // config wired in loan.route.js. Document types below match the
        // field names used there — keep them in sync if you rename fields.
        const documentFieldMap = {
            income_proof: "INCOME_PROOF",
            identity_proof: "IDENTITY_PROOF",
            collateral_proof: "COLLATERAL_PROOF",
        };

        if (req.files) {
            for (const [fieldName, documentType] of Object.entries(documentFieldMap)) {
                const fileArr = req.files[fieldName];
                if (fileArr && fileArr[0]) {
                    await insertLoanDocument(client, application.id, documentType, fileArr[0].path);
                }
            }
        }

        await client.query("COMMIT");

        const indicativeEmi = calculateIndicativeEmi(
            requestedAmount,
            Number(loanType.base_interest_rate),
            tenureMonths
        );

        return res.status(201).json({
            success: true,
            message: "Loan application submitted successfully.",
            data: {
                application_id: application.id,
                status: application.status,
                indicative_emi: indicativeEmi,
                indicative_rate: loanType.base_interest_rate,
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Loan application exception:", error);

        if (error.message?.includes("customer record")) {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({ success: false, message: "Internal server error while submitting loan application." });
    } finally {
        client.release();
    }
};

// GET /loan/my-applications
export const getMyLoanApplications = async (req, res) => {
    try {
        const customerId = await resolveCustomerId(req.user);
        const applications = await getLoanApplicationsByCustomer(customerId);
        return res.status(200).json({ success: true, data: applications });
    } catch (error) {
        console.error("Error fetching loan applications:", error);
        if (error.message?.includes("customer record")) {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to fetch loan applications." });
    }
};

// GET /loan/application/:id
export const getLoanApplicationDetails = async (req, res) => {
    try {
        const application = await getLoanApplicationById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: "Loan application not found." });
        }

        // Ownership check: a customer should only see their own
        // application. Admin bypass would need a role check on req.user —
        // flag if AdminOnboardingApplications.jsx's admin auth pattern
        // should also apply here for a loans-review screen.
        const customerId = await resolveCustomerId(req.user);
        if (application.customer_id !== customerId) {
            return res.status(403).json({ success: false, message: "You do not have access to this application." });
        }

        const documents = await getDocumentsByApplicationId(application.id);
        return res.status(200).json({ success: true, data: { ...application, documents } });
    } catch (error) {
        console.error("Error fetching loan application details:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch application details." });
    }
};