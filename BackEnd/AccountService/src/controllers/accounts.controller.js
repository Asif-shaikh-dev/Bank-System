import { pool } from "../config/db.js";

const COLUMNS = `a.id, a.customer_id, a.account_number, a.balance, a.account_type, a.account_scheme`;
//this is accounts.controller.js
export const getMyAccounts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ${COLUMNS}
             FROM accounts a JOIN customers c ON c.id = a.customer_id
             WHERE c.user_id = $1
             ORDER BY a.id;`,
            [req.user.id]
        );
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Failed to fetch accounts:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch accounts." });
    }
};

export const getMyAccountById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ${COLUMNS}
             FROM accounts a JOIN customers c ON c.id = a.customer_id
             WHERE a.id = $1 AND c.user_id = $2;`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }
        return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Failed to fetch account:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch account." });
    }
};