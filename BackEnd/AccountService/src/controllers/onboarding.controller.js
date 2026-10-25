import bcrypt from 'bcrypt';
import { pool } from '../config/db.js'; // Your PostgreSQL connection pool
import { duplicateApplicationCheck, generateAccountNumber,getOrCreateCustomer } from '../utils/accounts.util.js';
import { getOnboardingEmailTemplate, getPendingReviewEmailTemplate } from '../utils/emailTemplates.js';
import { accessRisk } from '../utils/accessRisk.js';
import axios from 'axios';
import { sendEmail } from '../utils/email.util.js';

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
        

        // STEP 2.7: Duplicate Application Check
            const pending = await pool.query(
                `SELECT 1 FROM onboarding_applications WHERE user_id = $1 AND status = 'PENDING_REVIEW' LIMIT 1;`,
                [userId]
            );
            if (pending.rows.length > 0) {
                return res.status(409).json({ success: false, message: "You already have an application under review." });
            }

            // 2) The Aadhaar number must not belong to a different user
            const aadhaarTaken = await pool.query(
                `SELECT 1 FROM customers WHERE aadhaar_no = $1 AND user_id <> $2
                UNION
                SELECT 1 FROM onboarding_applications
                WHERE aadhaar_no = $1 AND user_id <> $2 AND status IN ('PENDING_REVIEW','APPROVED')
                LIMIT 1;`,
                [aadhaar_no, userId]
            );
            if (aadhaarTaken.rows.length > 0) {
                return res.status(409).json({ success: false, message: "This Aadhaar number is already registered to another user." });
            }

            const randomTier = Math.random() < 0.5 ? 1 : 2; // never 0, so manual review is always required
        // try {
        //     randomTier = await accessRisk(Pan_card_no);
        // } catch (error) {
        //     console.error("Risk assessment failed:", error);
        //     return res.status(500).json({ success: false, message: "Risk assessment failed. Please try again later." });
        // }
        
        // STEP 3: Risk Assessment (kept as-is for now)
        // const riskTiers = [0, 1, 2];
        // const randomTier = riskTiers[Math.floor(Math.random() * riskTiers.length)];
        // const randomTier = 0;

        let applicationStatus = 'PENDING_REVIEW';
        if (randomTier === 0) {
            applicationStatus = 'APPROVED';
        }

                // STEP 4 + 5: persist the application and, if auto-approved, create customer + account atomically
                const client = await pool.connect();
                let applicationId, cifId, generatedAccNO;
                try {
                    await client.query("BEGIN");
        
                    const applicationInsert = await client.query(
                        `INSERT INTO onboarding_applications (
                            user_id, name, email_id, date_of_birth, pan_card_no, residential_address,
                            employment_status, source_of_income, phone_no, aadhaar_no,
                            proof_of_identity_path, proof_of_address_path, passport_photo_path,
                            risk_score, status, account_type, account_scheme
                        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
                        RETURNING id;`,
                        [
                            userId, name, email_id, date_of_birth, Pan_card_no, residential_address,
                            Empoyment_status, source_of_income, phone_no, aadhaar_no,
                            identityPath, addressPath, photoPath,
                            randomTier, applicationStatus, account_type, account_scheme
                        ]
                    );
                    applicationId = applicationInsert.rows[0].id;
        
                    if (applicationStatus === 'APPROVED') {
                        cifId = await getOrCreateCustomer(client, userId, aadhaar_no, applicationId);
        
                        generatedAccNO = await generateAccountNumber(client);
                        await client.query(
                            `INSERT INTO accounts (customer_id, account_number, balance, account_type, account_scheme)
                             VALUES ($1, $2, 0.00, $3, $4);`,
                            [cifId, generatedAccNO, account_type || 'SAVINGS', account_scheme || 'NOT_ASSIGNED']
                        );
                    }
        
                    await client.query("COMMIT");
                } catch (txError) {
                    await client.query("ROLLBACK");
                    throw txError; // handled by the outer catch below
                } finally {
                    client.release();
                }
        
                // Risk tier needs manual review: no customer record yet
                if (applicationStatus === 'PENDING_REVIEW') {
                    await sendEmail(
                        email_id,
                        "Application Received - Pending Review",
                        getPendingReviewEmailTemplate(name, applicationId)
                    );
                    return res.status(202).json({
                        success: true,
                        message: `Application submitted. Due to a risk tier of ${randomTier}, your account is pending manual compliance review.`,
                        application_id: applicationId,
                        status: applicationStatus
                    });
                }
        
                // try {
                //     await axios.post(process.env.EMAIL_SERVICE_URL + "/email/sendEmail", {
                //         email: email_id,
                //         subject: "Onboarding Successful",
                //         htmlContent: getOnboardingEmailTemplate(name, cifId, generatedAccNO)
                //     });
                // } catch (emailError) {
                //     console.error("Failed to send onboarding success email:", emailError);
                // }
        
                // // STEP 6: Welcome & Handshake Response
                // return res.status(201).json({
                //     success: true,
                //     message: "Congratulations! Onboarding completed successfully.",
                //     data: {
                //         cif_id: cifId,
                //         application_id: applicationId,
                //         status: applicationStatus,
                //         assigned_account: generatedAccNO,
                //         balance: 0.00
                //     }
                // });

    } catch (error) {
        console.error("Onboarding workflow exception:", error);
        return res.status(500).json({ success: false, message: "Internal server onboarding failure." });
    }
};

