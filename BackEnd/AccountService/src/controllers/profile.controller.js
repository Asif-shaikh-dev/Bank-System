import { pool } from "../config/db.js";

// Explicit column list: document paths never leave the server
const COLUMNS = `id, user_id, name, email_id, date_of_birth, pan_card_no,
  residential_address, employment_status, source_of_income, phone_no,
  aadhaar_no, risk_score, status, created_at, updated_at,
  account_type, account_scheme`;

export const getMyApplication = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ${COLUMNS}
             FROM onboarding_applications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 1;`,
            [req.user.id]   // same field accounts.controller.js uses
        );
        // null (not 404) when the user hasn't applied yet
        return res.status(200).json({ success: true, data: result.rows[0] ?? null });
    } catch (error) {
        console.error("Failed to fetch application:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch application." });
    }
};