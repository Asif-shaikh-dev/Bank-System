// controllers/loan.controller.js
import { pool } from '../config/db.js';
import { calculateEMI, buildAmortizationSchedule } from '../utils/loan.util.js';

// Which document types are mandatory, based on loan category + employment type
const requiredDocumentTypes = (requiresCollateral, employmentType) => {
    const docs = ['AADHAAR_POA', 'PAN_POI'];
    if (employmentType === 'SALARIED') docs.push('SALARY_SLIP');
    if (employmentType === 'SELF_EMPLOYED') docs.push('ITR');
    if (requiresCollateral) docs.push('COLLATERAL_PROOF');
    return docs;
};

export const applyForLoan = async (req, res) => {
    // req.user is set by the auth JWT middleware (see auth.middleware.js)
    const userId = req.user.id;

    const {
        loan_type_id, employment_type, requested_amount,
        tenure_months, purpose, monthly_income, collateral_description
    } = req.body;

    if (!loan_type_id || !employment_type || !requested_amount || !tenure_months || !monthly_income) {
        return res.status(400).json({ success: false, message: "Missing required loan application parameters." });
    }

    if (!['SALARIED', 'SELF_EMPLOYED'].includes(employment_type)) {
        return res.status(400).json({ success: false, message: "Invalid employment_type." });
    }

    try {
        // STEP 1: Applicant must already be an onboarded customer
        const customerQuery = await pool.query(
            `SELECT id FROM customers WHERE user_id = $1 LIMIT 1;`, [userId]
        );
        if (customerQuery.rows.length === 0) {
            return res.status(403).json({ success: false, message: "Only onboarded customers can apply for a loan." });
        }
        const customerId = customerQuery.rows[0].id;

        // STEP 2: Validate loan type + amount/tenure against its bounds
        const loanTypeQuery = await pool.query(
            `SELECT * FROM loan_types WHERE id = $1 AND is_active = TRUE LIMIT 1;`, [loan_type_id]
        );
        if (loanTypeQuery.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or inactive loan type." });
        }
        const loanType = loanTypeQuery.rows[0];

        const amount = parseFloat(requested_amount);
        const tenure = parseInt(tenure_months, 10);

        if (amount < loanType.min_amount || amount > loanType.max_amount) {
            return res.status(400).json({
                success: false,
                message: `Amount must be between ${loanType.min_amount} and ${loanType.max_amount} for ${loanType.name}.`
            });
        }
        if (tenure < loanType.min_tenure_months || tenure > loanType.max_tenure_months) {
            return res.status(400).json({
                success: false,
                message: `Tenure must be between ${loanType.min_tenure_months} and ${loanType.max_tenure_months} months for ${loanType.name}.`
            });
        }

        // STEP 3: Secured loans need collateral details
        if (loanType.requires_collateral && !collateral_description) {
            return res.status(400).json({
                success: false,
                message: `${loanType.name} is a secured loan and requires collateral_description.`
            });
        }

        // STEP 4: Validate that the right documents were uploaded
        const required = requiredDocumentTypes(loanType.requires_collateral, employment_type);
        const uploadedTypes = [];

        if (req.files?.['aadhaar_card']) uploadedTypes.push('AADHAAR_POA');
        if (req.files?.['pan_card']) uploadedTypes.push('PAN_POI');
        if (req.files?.['salary_slips']) uploadedTypes.push('SALARY_SLIP');
        if (req.files?.['itr_documents']) uploadedTypes.push('ITR');
        if (req.files?.['collateral_document']) uploadedTypes.push('COLLATERAL_PROOF');

        const missing = required.filter(type => !uploadedTypes.includes(type));
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required documents: ${missing.join(', ')}.`
            });
        }

        // STEP 5: Self-employed applicants must show 2-3 years of ITR
        if (employment_type === 'SELF_EMPLOYED' && req.files['itr_documents'].length < 2) {
            return res.status(400).json({
                success: false,
                message: "Self-employed applicants must submit at least 2 years of ITR documents."
            });
        }

        // STEP 6: Insert the application
        const applicationInsert = await pool.query(
            `INSERT INTO loan_applications (
                user_id, customer_id, loan_type_id, employment_type,
                requested_amount, tenure_months, purpose, monthly_income, collateral_description
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING id;`,
            [userId, customerId, loan_type_id, employment_type, amount, tenure, purpose || null, monthly_income, collateral_description || null]
        );
        const applicationId = applicationInsert.rows[0].id;

        // STEP 7: Persist document rows
        const docInserts = [];
        if (req.files['aadhaar_card']) docInserts.push(['AADHAAR_POA', req.files['aadhaar_card'][0].path]);
        if (req.files['pan_card']) docInserts.push(['PAN_POI', req.files['pan_card'][0].path]);
        if (req.files['salary_slips']) req.files['salary_slips'].forEach(f => docInserts.push(['SALARY_SLIP', f.path]));
        if (req.files['itr_documents']) req.files['itr_documents'].forEach(f => docInserts.push(['ITR', f.path]));
        if (req.files['collateral_document']) docInserts.push(['COLLATERAL_PROOF', req.files['collateral_document'][0].path]);

        for (const [docType, filePath] of docInserts) {
            await pool.query(
                `INSERT INTO loan_documents (loan_application_id, document_type, file_path) VALUES ($1, $2, $3);`,
                [applicationId, docType, filePath]
            );
        }

        return res.status(201).json({
            success: true,
            message: "Loan application submitted successfully and is pending review.",
            application_id: applicationId,
            status: 'PENDING_REVIEW'
        });

    } catch (error) {
        console.error("Loan application exception:", error);
        return res.status(500).json({ success: false, message: "Internal server error while submitting loan application." });
    }
};

// ---------------------------------------------------------------------------
// ADMIN: Review & approve/reject a loan application
// ---------------------------------------------------------------------------
export const reviewLoanApplication = async (req, res) => {
    const adminId = req.user.id; // set by verifyJWT + isAdmin middleware
    const { application_id, decision, interest_rate, rejection_reason } = req.body;

    if (!application_id || !['APPROVED', 'REJECTED'].includes(decision)) {
        return res.status(400).json({ success: false, message: "application_id and a valid decision are required." });
    }
    if (decision === 'APPROVED' && !interest_rate) {
        return res.status(400).json({ success: false, message: "interest_rate is required to approve a loan." });
    }
    if (decision === 'REJECTED' && !rejection_reason) {
        return res.status(400).json({ success: false, message: "rejection_reason is required to reject a loan." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const appQuery = await client.query(
            `SELECT * FROM loan_applications WHERE id = $1 AND status = 'PENDING_REVIEW' LIMIT 1;`,
            [application_id]
        );
        if (appQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "No pending application found with that ID." });
        }
        const application = appQuery.rows[0];

        if (decision === 'REJECTED') {
            await client.query(
                `UPDATE loan_applications
                 SET status = 'REJECTED', rejection_reason = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
                 WHERE id = $3;`,
                [rejection_reason, adminId, application_id]
            );
            await client.query('COMMIT');
            return res.status(200).json({ success: true, message: "Loan application rejected.", status: 'REJECTED' });
        }

        // APPROVED -> mark application, disburse into an existing savings account, build EMI schedule
        await client.query(
            `UPDATE loan_applications
             SET status = 'APPROVED', proposed_interest_rate = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
             WHERE id = $3;`,
            [interest_rate, adminId, application_id]
        );

        const accountQuery = await client.query(
            `SELECT id FROM accounts WHERE customer_id = $1 LIMIT 1;`,
            [application.customer_id]
        );
        if (accountQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: "Customer has no linked account for disbursement." });
        }
        const accountId = accountQuery.rows[0].id;

        const { emiAmount, schedule } = buildAmortizationSchedule(
            parseFloat(application.requested_amount),
            parseFloat(interest_rate),
            application.tenure_months,
            new Date()
        );

        const loanInsert = await client.query(
            `INSERT INTO loans (
                loan_application_id, customer_id, disbursement_account_id,
                principal_amount, interest_rate, tenure_months, emi_amount, next_due_date
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING id;`,
            [
                application.id, application.customer_id, accountId,
                application.requested_amount, interest_rate, application.tenure_months,
                emiAmount, schedule[0].due_date
            ]
        );
        const loanId = loanInsert.rows[0].id;

        for (const row of schedule) {
            await client.query(
                `INSERT INTO loan_emis (loan_id, emi_number, due_date, emi_amount, principal_component, interest_component)
                 VALUES ($1,$2,$3,$4,$5,$6);`,
                [loanId, row.emi_number, row.due_date, row.emi_amount, row.principal_component, row.interest_component]
            );
        }

        // Credit the disbursed amount to the customer's account
        await client.query(
            `UPDATE accounts SET balance = balance + $1 WHERE id = $2;`,
            [application.requested_amount, accountId]
        );

        await client.query(
            `UPDATE loan_applications SET status = 'DISBURSED', updated_at = NOW() WHERE id = $1;`,
            [application.id]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: "Loan approved and disbursed successfully.",
            data: { loan_id: loanId, emi_amount: emiAmount, tenure_months: application.tenure_months, first_due_date: schedule[0].due_date }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Loan review exception:", error);
        return res.status(500).json({ success: false, message: "Internal server error while reviewing loan application." });
    } finally {
        client.release();
    }
};

// ---------------------------------------------------------------------------
// EMI reminder job — NOT an HTTP endpoint, meant to be scheduled (see below)
// ---------------------------------------------------------------------------
export const sendMonthlyEMIReminders = async () => {
    /*
     * WHAT THIS SHOULD DO (implement once the Email Service contract is finalized):
     *
     * 1. Query loan_emis joined to loans + customers + users, where:
     *      - status = 'PENDING'
     *      - due_date falls within the next N days (e.g. 3-5 days out), so reminders
     *        go out ahead of the due date, not on/after it
     *
     *    SELECT le.id, le.due_date, le.emi_amount, l.id AS loan_id,
     *           u.name, u.email_id
     *    FROM loan_emis le
     *    JOIN loans l ON l.id = le.loan_id
     *    JOIN customers c ON c.id = l.customer_id
     *    JOIN users u ON u.id = c.user_id
     *    WHERE le.status = 'PENDING'
     *      AND le.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days';
     *
     * 2. For each row, call the Email Service the same way forgot-password OTP does today
     *    (POST http://localhost:<EMAIL_SERVICE_PORT>/email/send-otp is OTP-specific,
     *    so this likely needs a new generic endpoint like /email/send-notification,
     *    or a dedicated /email/send-emi-reminder on the Email Service).
     *
     * 3. Also sweep for overdue EMIs (due_date < CURRENT_DATE AND status = 'PENDING')
     *    and flip their status to 'OVERDUE' before/after sending a separate
     *    "payment overdue" email, and consider updating loans.status to 'DEFAULTED'
     *    after N consecutive missed EMIs.
     *
     * 4. Wire this function into a scheduler in your app entrypoint, e.g. with node-cron:
     *
     *    import cron from 'node-cron';
     *    import { sendMonthlyEMIReminders } from './controllers/loan.controller.js';
     *
     *    // Runs once a day at 9 AM server time
     *    cron.schedule('0 9 * * *', sendMonthlyEMIReminders);
     *
     * Leaving this unimplemented for now per your note — flagging the shape only.
     */
};