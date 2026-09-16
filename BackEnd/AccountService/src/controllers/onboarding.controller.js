import bcrypt from 'bcrypt';
import { pool } from '../config/db.js'; // Your PostgreSQL connection pool
import { duplicateApplicationCheck, generateAccountNumber } from '../utils/accounts.util.js';
import { getOnboardingEmailTemplate } from '../utils/emailTemplates.js';
import { accessRisk } from '../utils/accessRisk.js';
import axios from 'axios';

export const handleOnboarding = async (req, res) => {
    const {
        name, email_id, date_of_birth, Pan_card_no, residential_address,
        Empoyment_status, source_of_income, phone_no, aadhaar_no,account_type,account_scheme
    } = req.body;

    // STEP 1: Application Form Validation
    if (!name || !email_id || !date_of_birth || !Pan_card_no || !residential_address ||
        !Empoyment_status || !source_of_income || !phone_no || !aadhaar_no || !account_type || !account_scheme) {
        return res.status(400).json({ success: false, message: "Missing required onboarding parameters." });
    }

    if (!req.files || !req.files['proof_of_identity'] || !req.files['proof_of_address'] || !req.files['passport_size_photo']) {
        return res.status(400).json({
            success: false,
            message: "Missing required documents. Please upload identity proof, address proof, and a passport-size photo."
        });
    }
    const identityPath = req.files['proof_of_identity'][0].path;
    const addressPath = req.files['proof_of_address'][0].path;
    const photoPath = req.files['passport_size_photo'][0].path;

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(date_of_birth)) {
        return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const parsedDate = new Date(date_of_birth);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: "The provided date of birth is invalid." });
    }

    // STEP 2.5: 18+ Age Check
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (parsedDate > cutoff) {
        return res.status(400).json({ success: false, message: "User must be at least 18 years old." });
    }

    try {
        // STEP 1.5: Resolve user_id from the logged-in user's email
        const userQuery = await pool.query(`SELECT id FROM users WHERE email_id = $1 LIMIT 1;`, [email_id]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found in the system. Please register first." });
        }
        const userId = userQuery.rows[0].id;

        // STEP 2: KYC Verification (Aadhaar Table Check)
        const aadhaarResult = await pool.query(
            `SELECT * FROM aadhaar_card WHERE aadhaar_number = $1 LIMIT 1;`,
            [aadhaar_no]
        );
        if (aadhaarResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: "KYC Failed: Invalid Aadhaar number." });
        }

        const aadhaarRecord = aadhaarResult.rows[0];
        // if (aadhaarRecord.person_name.trim().toLowerCase() !== name.trim().toLowerCase()) {
        //     return res.status(400).json({ success: false, message: "KYC Failed: Name does not match government records." });
        // }

        // STEP 2.6: PAN Card Verification (PAN Table Check)
        const panResult = await pool.query(
            `SELECT * FROM pancards WHERE pan_number = $1 LIMIT 1;`,
            [Pan_card_no]
        );
        if (panResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: "PAN Verification Failed: Invalid PAN number." });
        }

        const panRecord = panResult.rows[0];
        // if (panRecord.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
        //     return res.status(400).json({ success: false, message: "PAN Verification Failed: Name does not match PAN records." });
        // }
        

        // Prevent duplicate applications/customers for this user or aadhaar number
        if(await duplicateApplicationCheck(pool, aadhaar_no, userId)) {
            return res.status(409).json({ success: false, message: "Duplicate application detected. You have already applied or are an existing customer." });
        }

        let randomTier;
        try {
            randomTier = await accessRisk(Pan_card_no);
        } catch (error) {
            console.error("Risk assessment failed:", error);
            return res.status(500).json({ success: false, message: "Risk assessment failed. Please try again later." });
        }
        
        // STEP 3: Risk Assessment (kept as-is for now)
        // const riskTiers = [0, 1, 2];
        // const randomTier = riskTiers[Math.floor(Math.random() * riskTiers.length)];
        // const randomTier = 0;

        let applicationStatus = 'PENDING_REVIEW';
        if (randomTier === 0) {
            applicationStatus = 'APPROVED';
        }

        // STEP 4: Persist the application (source of truth for the onboarding attempt)
        const applicationInsert = await pool.query(
            `INSERT INTO onboarding_applications (
                user_id, name, email_id, date_of_birth, pan_card_no, residential_address,
                employment_status, source_of_income, phone_no, aadhaar_no,
                proof_of_identity_path, proof_of_address_path, passport_photo_path,
                risk_score, status,account_type,account_scheme
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            RETURNING id;`,
            [
                userId, name, email_id, date_of_birth, Pan_card_no, residential_address,
                Empoyment_status, source_of_income, phone_no, aadhaar_no,
                identityPath, addressPath, photoPath,
                randomTier, applicationStatus,account_type,account_scheme
            ]
        );
        const applicationId = applicationInsert.rows[0].id;

        // If risk tier requires manual review, stop here — no customer record yet
        if (applicationStatus === 'PENDING_REVIEW') {
            return res.status(202).json({
                success: true,
                message: `Application submitted. Due to a risk tier of ${randomTier}, your account is pending manual compliance review.`,
                application_id: applicationId,
                status: applicationStatus
            });
        }

        // STEP 5: APPROVED -> promote application into an actual customer record
        const customerInsert = await pool.query(
            `INSERT INTO customers (user_id, aadhaar_no, onboarding_application_id)
             VALUES ($1, $2, $3)
             RETURNING id;`, // this id is the CIF ID
            [userId, aadhaar_no, applicationId]
        );
        const cifId = customerInsert.rows[0].id;

        // Create their first bank account
        const generatedAccNO = await generateAccountNumber(pool);
        await pool.query(
            `INSERT INTO accounts (customer_id, account_number, balance, account_type)
             VALUES ($1, $2, $3, $4);`,
            [cifId, generatedAccNO, 0.00, 'SAVINGS']
        );

        try {
            await axios.post(process.env.EMAIL_SERVICE_URL + "/email/sendEmail", {
            email: email_id,
            subject: "Onboarding Successful",
            htmlContent:getOnboardingEmailTemplate(name, cifId, generatedAccNO)
            });
        } catch (emailError) {
            console.error("Failed to send onboarding success email:", emailError);
        }

        // STEP 6: Welcome & Handshake Response
        return res.status(201).json({
            success: true,
            message: "Congratulations! Onboarding completed successfully.",
            data: {
                cif_id: cifId,
                application_id: applicationId,
                status: applicationStatus,
                assigned_account: generatedAccNO,
                balance: 0.00
            }
        });

    } catch (error) {
        console.error("Onboarding workflow exception:", error);
        return res.status(500).json({ success: false, message: "Internal server onboarding failure." });
    }
};

