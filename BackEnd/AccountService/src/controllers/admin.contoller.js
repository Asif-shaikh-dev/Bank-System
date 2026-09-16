import { pool } from '../config/db.js';
import axios from 'axios';
import { generateAccountNumber, toDocumentUrl } from '../utils/accounts.util.js';
import { getOnboardingEmailTemplate } from '../utils/emailTemplates.js';

export const getOnboardingList = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM onboarding_applications 
            WHERE status = 'PENDING_REVIEW' 
            ORDER BY created_at 
            DESC;`);

        // Convert filesystem paths to servable /uploads URLs and drop the
        // raw paths from the response — no reason to leak local disk
        // layout to the client once the URL exists.
        const data = result.rows.map((row) => {
            const {
                proof_of_identity_path,
                proof_of_address_path,
                passport_photo_path,
                ...rest
            } = row;

            return {
                ...rest,
                proof_of_identity_url: toDocumentUrl(proof_of_identity_path),
                proof_of_address_url: toDocumentUrl(proof_of_address_path),
                passport_photo_url: toDocumentUrl(passport_photo_path),
            };
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Failed to fetch onboarding list:", error);
        return res.status(500).json({ success: false, message: "Internal server error while fetching onboarding list." });
    }
}

export const approveOnboardingApplication = async (req, res) => {
    const applicationId = req.params.id;

    try {
        const appResult = await pool.query(
            `SELECT * FROM onboarding_applications WHERE id = $1 LIMIT 1;`,
            [applicationId]
        );
        if (appResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        const application = appResult.rows[0];

        if (application.status !== 'PENDING_REVIEW') {
            return res.status(409).json({ success: false, message: `Application is already ${application.status}.` });
        }

        await pool.query(
            `UPDATE onboarding_applications SET status = 'APPROVED' WHERE id = $1;`,
            [applicationId]
        );

        // Mirrors STEP 5 of handleOnboarding — promote into a real customer + account
        const customerInsert = await pool.query(
            `INSERT INTO customers (user_id, aadhaar_no, onboarding_application_id)
             VALUES ($1, $2, $3)
             RETURNING id;`,
            [application.user_id, application.aadhaar_no, applicationId]
        );
        const cifId = customerInsert.rows[0].id;

        const generatedAccNO = await generateAccountNumber(pool);
        await pool.query(
            `INSERT INTO accounts (customer_id, account_number, balance, account_type)
             VALUES ($1, $2, $3, $4);`,
            [cifId, generatedAccNO, 0.00, application.account_type || 'SAVINGS']
        );

        try {
            await axios.post(process.env.EMAIL_SERVICE_URL + "/email/sendEmail", {
                email: application.email_id,
                subject: "Onboarding Approved",
                htmlContent: getOnboardingEmailTemplate(application.name, cifId, generatedAccNO),
            });
        } catch (emailError) {
            console.error("Failed to send approval email:", emailError);
        }

        return res.status(200).json({
            success: true,
            message: "Application approved and account created.",
            data: { application_id: applicationId, cif_id: cifId, account_number: generatedAccNO },
        });
    } catch (error) {
        console.error("Failed to approve onboarding application:", error);
        return res.status(500).json({ success: false, message: "Internal server error while approving application." });
    }
};

export const rejectOnboardingApplication = async (req, res) => {
    const applicationId = req.params.id;
    try {
        const result = await pool.query(
            `UPDATE onboarding_applications SET status = 'REJECTED' WHERE id = $1 RETURNING *;`,
            [applicationId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        return res.status(200).json({ success: true, message: "Application rejected successfully.", data: result.rows[0] });
    } catch (error) {
        console.error("Failed to reject onboarding application:", error);
        return res.status(500).json({ success: false, message: "Internal server error while rejecting application." });
    }
};