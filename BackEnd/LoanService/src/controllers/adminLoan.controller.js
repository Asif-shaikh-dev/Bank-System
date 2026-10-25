import { pool } from "../config/db.js";
import { calculateIndicativeEmi } from "../utils/loan.util.js";
import { collectDueEmis } from "../services/emiCollection.js";

const DEFAULT_RATE = 7; // % p.a., used when the loan type has no base rate

const addMonths = (date, n) => {
    const y = date.getFullYear();
    const m = date.getMonth() + n;
    const lastDay = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(date.getDate(), lastDay));
};
const toYMD = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const round2 = (n) => Math.round(n * 100) / 100;


// POST /loan/admin/collect-emis   body: { as_of? }
export const runEmiCollection = async (req, res) => {
    const asOf = req.body?.as_of || null;
    if (asOf && !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
        return res.status(400).json({ success: false, message: "as_of must be YYYY-MM-DD." });
    }
    try {
        const summary = await collectDueEmis(asOf);
        return res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error("EMI collection failed:", error);
        return res.status(500).json({ success: false, message: "EMI collection failed." });
    }
};

// Reducing-balance schedule; last EMI absorbs rounding so the balance ends at exactly 0.
const buildSchedule = (principal, annualRate, months, emi, startDate) => {
    const r = annualRate / 12 / 100;
    let balance = principal;
    const rows = [];
    for (let i = 1; i <= months; i++) {
        const interest = round2(balance * r);
        let principalPart = round2(emi - interest);
        let amount = emi;
        if (i === months) {
            principalPart = round2(balance);
            amount = round2(principalPart + interest);
        }
        balance = round2(balance - principalPart);
        rows.push({ n: i, due: toYMD(addMonths(startDate, i)), amount, principalPart, interest });
    }
    return rows;
};

// GET /loan/admin/pending
export const listPendingLoans = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT la.id, la.requested_amount, la.tenure_months, la.purpose, la.monthly_income,
                    la.employment_type, la.collateral_description, la.created_at,
                    lt.name AS loan_type_name, lt.base_interest_rate,
                    u.name, u.email_id, u.phone_no,
                    COALESCE((SELECT json_agg(json_build_object('type', ld.document_type, 'path', ld.file_path) ORDER BY ld.id)
                              FROM loan_documents ld WHERE ld.loan_application_id = la.id), '[]') AS documents
             FROM loan_applications la
             JOIN loan_types lt ON lt.id = la.loan_type_id
             JOIN users u ON u.id = la.user_id
             WHERE la.status = 'PENDING_REVIEW'
             ORDER BY la.created_at DESC;`
        );
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Failed to list pending loans:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch pending loan applications." });
    }
};

// POST /loan/admin/:id/approve   body: { interest_rate? }
export const approveLoan = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const appRes = await client.query(
            `SELECT la.*, lt.base_interest_rate
             FROM loan_applications la
             JOIN loan_types lt ON lt.id = la.loan_type_id
             WHERE la.id = $1
             FOR UPDATE OF la;`,
            [id]
        );
        const app = appRes.rows[0];
        if (!app) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        if (app.status !== "PENDING_REVIEW") {
            await client.query("ROLLBACK");
            return res.status(409).json({ success: false, message: `Application is already ${app.status}.` });
        }

        const requested = req.body?.interest_rate;
        const rate =
            requested !== undefined && requested !== null && requested !== ""
                ? Number(requested)
                : app.base_interest_rate != null
                ? Number(app.base_interest_rate)
                : DEFAULT_RATE;
        if (!Number.isFinite(rate) || rate <= 0 || rate > 40) {
            await client.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "Interest rate must be between 0 and 40." });
        }

        const accRes = await client.query(
            `SELECT id FROM accounts WHERE customer_id = $1 ORDER BY id LIMIT 1 FOR UPDATE;`,
            [app.customer_id]
        );
        if (accRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({ success: false, message: "Customer has no account to disburse into." });
        }
        const accountId = accRes.rows[0].id;

        const principal = Number(app.requested_amount);
        const tRes = await client.query(`SELECT balance FROM bank_treasury WHERE id = 1 FOR UPDATE;`);
        if (Number(tRes.rows[0].balance) < principal) {
            await client.query("ROLLBACK");
            return res.status(409).json({ success: false, message: "Bank treasury has insufficient funds for this loan." });
        }

        const tenure = app.tenure_months;
        const emi = calculateIndicativeEmi(principal, rate, tenure);
        const today = new Date();
        const schedule = buildSchedule(principal, rate, tenure, emi, today);

        await client.query(
            `UPDATE loan_applications
             SET status = 'DISBURSED', proposed_interest_rate = $2, reviewed_at = NOW(), updated_at = NOW()
             WHERE id = $1;`,
            [id, rate]
        );

        const loanRes = await client.query(
            `INSERT INTO loans (loan_application_id, customer_id, disbursement_account_id,
                                principal_amount, interest_rate, tenure_months, emi_amount, next_due_date)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
             RETURNING id;`,
            [id, app.customer_id, accountId, principal, rate, tenure, emi, schedule[0].due]
        );
        const loanId = loanRes.rows[0].id;

        await client.query(
            `INSERT INTO loan_emis (loan_id, emi_number, due_date, emi_amount, principal_component, interest_component)
             SELECT $1, * FROM unnest($2::int[], $3::date[], $4::numeric[], $5::numeric[], $6::numeric[]);`,
            [
                loanId,
                schedule.map((s) => s.n),
                schedule.map((s) => s.due),
                schedule.map((s) => s.amount),
                schedule.map((s) => s.principalPart),
                schedule.map((s) => s.interest),
            ]
        );

        const bal = await client.query(
            `UPDATE accounts SET balance = COALESCE(balance, 0) + $1 WHERE id = $2 RETURNING balance;`,
            [principal, accountId]
        );
        await client.query(
            `INSERT INTO transactions (account_id, type, amount, balance_after, description, reference)
             VALUES ($1, 'CREDIT', $2, $3, $4, $5);`,
            [accountId, principal, bal.rows[0].balance, `Loan disbursed (application #${id})`, `LOAN-${loanId}`]
        );

        const t = await client.query(
            `UPDATE bank_treasury SET balance = balance - $1, updated_at = NOW() WHERE id = 1 RETURNING balance;`,
            [principal]
        );
        await client.query(
            `INSERT INTO treasury_ledger (type, amount, balance_after, reference, description)
             VALUES ('LOAN_DISBURSEMENT', $1, $2, $3, $4);`,
            [-principal, t.rows[0].balance, `LOAN-${loanId}`, `Loan #${loanId} disbursed`]
        );

        await client.query("COMMIT");
        return res.status(200).json({
            success: true,
            message: "Loan approved and disbursed.",
            data: { loan_id: loanId, interest_rate: rate, emi_amount: emi, first_due_date: schedule[0].due },
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Failed to approve loan:", error);
        return res.status(500).json({ success: false, message: "Internal server error while approving loan." });
    } finally {
        client.release();
    }
};

// POST /loan/admin/:id/reject   body: { reason }
export const rejectLoan = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const reason = String(req.body?.reason || "").trim();
    if (!reason) {
        return res.status(400).json({ success: false, message: "A rejection reason is required." });
    }
    try {
        const result = await pool.query(
            `UPDATE loan_applications
             SET status = 'REJECTED', rejection_reason = $2, reviewed_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND status = 'PENDING_REVIEW'
             RETURNING id;`,
            [id, reason]
        );
        if (result.rowCount === 0) {
            return res.status(409).json({ success: false, message: "Application not found or already reviewed." });
        }
        return res.status(200).json({ success: true, message: "Loan application rejected." });
    } catch (error) {
        console.error("Failed to reject loan:", error);
        return res.status(500).json({ success: false, message: "Internal server error while rejecting loan." });
    }
};












import { setEmiInterval, getEmiInterval } from "../services/emiScheduler.js";

// GET /loan/admin/emi-interval
export const readEmiInterval = (req, res) =>
    res.status(200).json({ success: true, data: { seconds: getEmiInterval() } });

// POST /loan/admin/emi-interval   body: { seconds }   (0 = real monthly mode)
export const updateEmiInterval = (req, res) => {
    const sec = Number(req.body?.seconds);
    if (!Number.isInteger(sec) || (sec !== 0 && (sec < 5 || sec > 86400))) {
        return res.status(400).json({ success: false, message: "Use 0 (real mode) or 5 to 86400 seconds." });
    }
    setEmiInterval(sec);
    return res.status(200).json({ success: true, data: { seconds: sec } });
};