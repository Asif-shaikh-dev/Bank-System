import bcrypt from 'bcrypt';
import { pool } from '../config/db.js'; // Your PostgreSQL connection pool
import { generateAccountNumber } from '../utils/accounts.util.js';

export const handleOnboarding = async (req, res) => {
    const { name, email_id, phone_no, aadhaar_no } = req.body;

    // STEP 1: Application Form Validation
    if (!name || !email_id || !aadhaar_no || !phone_no) {
        return res.status(400).json({ success: false, message: "Missing required onboarding parameters." });
    }

    try {
        // STEP 1.5: Get user_id from the users table based on email
        // Since the customers table requires a user_id, we must fetch it first.
        const userQuery = await pool.query(`SELECT id FROM users WHERE email_id = $1 LIMIT 1;`, [email_id]);
        
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found in the system. Please register first." });
        }
        const userId = userQuery.rows[0].id;

        // STEP 2: KYC Verification (Aadhaar Table Check)
        const aadhaarQuery = `SELECT * FROM aadhaar_card WHERE aadhaar_number = $1 LIMIT 1;`;
        const aadhaarResult = await pool.query(aadhaarQuery, [aadhaar_no]);

        if (aadhaarResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: "KYC Failed: Invalid KYC number." });
        }

        const aadhaarRecord = aadhaarResult.rows[0];
        
        // Note: Strict name matching will fail if DB has "Aasif Hamid Shaikh" but KYC card has "Aasif Shaikh".
        // You may want to implement a partial match logic (e.g., checking if first and last names are included).
        if (aadhaarRecord.person_name.trim().toLowerCase() !== name.trim().toLowerCase()) {
            return res.status(400).json({ success: false, message: "KYC Failed: Name does not match government records." });
        }

        // STEP 3: Risk Assessment
        const riskTiers = [0, 1, 2];
        // const randomTier = riskTiers[Math.floor(Math.random() * riskTiers.length)]; 
        const randomTier = 0; 
        
        let applicationStatus = 'PENDING_REVIEW';
        if (randomTier === 0) {
            applicationStatus = 'APPROVED';
        }

        // STEP 4: Core Banking Record (Database Entry)
        // Check if the user_id or Aadhaar number already exists in customers table
        const duplicateCheckQuery = `
            SELECT * FROM customers 
            WHERE aadhaar_no = $1 OR user_id = $2 
            LIMIT 1;
        `;
        const duplicateCheckResult = await pool.query(duplicateCheckQuery, [aadhaar_no, userId]);

        if (duplicateCheckResult.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Duplicate entry: This user or KYC document has already applied." });
        }

        // Insert into customers table mapping correctly to your DB schema
        const customerInsertQuery = `
            INSERT INTO customers (user_id, aadhaar_no, risk_score, status)
            VALUES ($1, $2, $3, $4)
            RETURNING id; -- This returned ID acts as our master CIF ID
        `;
        
        const customerResult = await pool.query(customerInsertQuery, [
            userId, aadhaar_no, randomTier, applicationStatus
        ]);
        
        const cifId = customerResult.rows[0].id;

        // If the candidate was marked high or medium risk, stop here
        if (applicationStatus === 'PENDING_REVIEW') {
            return res.status(202).json({
                success: true,
                message: `Application submitted. Due to a risk tier of ${randomTier}, your account is pending manual compliance review.`,
                cif_id: cifId,
                status: applicationStatus
            });
        }

        // Automated execution for LOW-risk paths (Create their first bank account record)
        const generatedAccNO = await generateAccountNumber(pool);
        
        const accountInsertQuery = `
            INSERT INTO accounts (customer_id, account_number, balance, account_type)
            VALUES ($1, $2, $3, $4);
        `;
        await pool.query(accountInsertQuery, [cifId, generatedAccNO, 0.00, 'SAVINGS']);

        // STEP 5: Welcome & Handshake Response
        return res.status(201).json({
            success: true,
            message: "Congratulations! Onboarding completed successfully.",
            data: {
                cif_id: cifId,
                status: applicationStatus,
                assigned_account: generatedAccNO, // FIXED: was previously undefined `mockAccountNumber`
                balance: 0.00
            }
        });

    } catch (error) {
        console.error("Onboarding workflow exception:", error);
        return res.status(500).json({ success: false, message: "Internal server onboarding failure." });
    }
};