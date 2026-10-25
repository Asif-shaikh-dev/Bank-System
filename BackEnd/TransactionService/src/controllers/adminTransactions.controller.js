import { pool } from "../config/db.js";

export const listAllTransactions = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.id, t.type, t.amount, t.balance_after, t.description, t.reference, t.created_at,
                    a.account_number, u.name, u.email_id
             FROM transactions t
             JOIN accounts a ON a.id = t.account_id
             JOIN customers c ON c.id = a.customer_id
             JOIN users u ON u.id = c.user_id
             ORDER BY t.created_at DESC
             LIMIT 300;`
        );
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Failed to list transactions:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch transactions." });
    }
};

export const getTreasury = async (req, res) => {
    try {
        const [bal, totals, ledger, outstanding] = await Promise.all([
            pool.query(`SELECT balance FROM bank_treasury WHERE id = 1;`),
            pool.query(
                `SELECT
                   COALESCE(-SUM(amount) FILTER (WHERE type = 'LOAN_DISBURSEMENT'), 0) AS loans_disbursed,
                   COALESCE(SUM(amount) FILTER (WHERE type = 'EMI_PRINCIPAL'), 0)      AS principal_recovered,
                   COALESCE(SUM(amount) FILTER (WHERE type = 'EMI_INTEREST'), 0)       AS interest_earned
                 FROM treasury_ledger;`
            ),
            pool.query(`SELECT * FROM treasury_ledger ORDER BY id DESC LIMIT 100;`),
            pool.query(`SELECT COALESCE(SUM(principal_component), 0) AS outstanding FROM loan_emis WHERE status <> 'PAID';`),
        ]);
        return res.status(200).json({
            success: true,
            data: {
                balance: Number(bal.rows[0]?.balance || 0),
                ...Object.fromEntries(Object.entries(totals.rows[0]).map(([k, v]) => [k, Number(v)])),
                outstanding_principal: Number(outstanding.rows[0].outstanding),
                ledger: ledger.rows,
            },
        });
    } catch (error) {
        console.error("Failed to fetch treasury:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch treasury." });
    }
};