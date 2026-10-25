import { pool } from "../config/db.js";

const isValidPastDate = (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
    const d = new Date(s);
    return !isNaN(d.getTime()) && d <= new Date();
};

export const getAccountHolders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.id AS account_id, a.account_number, a.account_type, a.account_scheme, a.balance,
                    c.id AS customer_id, u.name, u.email_id, u.phone_no
             FROM accounts a
             JOIN customers c ON c.id = a.customer_id
             JOIN users u ON u.id = c.user_id
             ORDER BY u.name, a.id;`
        );
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Failed to list account holders:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch account holders." });
    }
};

export const listAadhaar = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT aadhaar_number, person_name, dob, gender, registered_phone
             FROM aadhaar_card ORDER BY person_name LIMIT 200;`
        );
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Failed to list Aadhaar records:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch Aadhaar records." });
    }
};

export const addAadhaar = async (req, res) => {
    const number = String(req.body?.aadhaar_number || "").replace(/\s/g, "");
    const name = String(req.body?.person_name || "").trim();
    const dob = req.body?.dob;
    const gender = req.body?.gender || null;
    const phone = String(req.body?.registered_phone || "").replace(/\D/g, "") || null;

    if (!/^\d{12}$/.test(number)) {
        return res.status(400).json({ success: false, message: "Aadhaar number must be exactly 12 digits." });
    }
    if (!name) return res.status(400).json({ success: false, message: "Name is required." });
    if (!isValidPastDate(dob)) {
        return res.status(400).json({ success: false, message: "Enter a valid date of birth (YYYY-MM-DD)." });
    }
    if (gender && !["Male", "Female", "Other"].includes(gender)) {
        return res.status(400).json({ success: false, message: "Gender must be Male, Female or Other." });
    }

    try {
        const exists = await pool.query(`SELECT 1 FROM aadhaar_card WHERE aadhaar_number = $1;`, [number]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ success: false, message: "This Aadhaar number already exists." });
        }
        await pool.query(
            `INSERT INTO aadhaar_card (aadhaar_number, person_name, dob, gender, registered_phone)
             VALUES ($1,$2,$3,$4,$5);`,
            [number, name, dob, gender, phone]
        );
        return res.status(201).json({ success: true, message: "Aadhaar holder added." });
    } catch (error) {
        console.error("Failed to add Aadhaar:", error);
        return res.status(500).json({ success: false, message: "Could not add the Aadhaar record." });
    }
};

export const listPan = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, pan_number, name, father_name, date_of_birth FROM pancards ORDER BY id DESC LIMIT 200;`
        );
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Failed to list PAN records:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch PAN records." });
    }
};

export const addPan = async (req, res) => {
    const number = String(req.body?.pan_number || "").trim().toUpperCase();
    const name = String(req.body?.name || "").trim();
    const father = String(req.body?.father_name || "").trim();
    const dob = req.body?.date_of_birth;

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(number)) {
        return res.status(400).json({ success: false, message: "PAN must look like ABCDE1234F." });
    }
    if (!name || !father) {
        return res.status(400).json({ success: false, message: "Name and father's name are required." });
    }
    if (!isValidPastDate(dob)) {
        return res.status(400).json({ success: false, message: "Enter a valid date of birth (YYYY-MM-DD)." });
    }

    try {
        const exists = await pool.query(`SELECT 1 FROM pancards WHERE pan_number = $1;`, [number]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ success: false, message: "This PAN already exists." });
        }
        await pool.query(
            `INSERT INTO pancards (pan_number, name, father_name, date_of_birth) VALUES ($1,$2,$3,$4);`,
            [number, name, father, dob]
        );
        return res.status(201).json({ success: true, message: "PAN holder added." });
    } catch (error) {
        console.error("Failed to add PAN:", error);
        return res.status(500).json({ success: false, message: "Could not add the PAN record." });
    }
};