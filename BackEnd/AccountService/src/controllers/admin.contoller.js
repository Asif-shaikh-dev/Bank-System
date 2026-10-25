import { pool } from '../config/db.js';
import { generateAccountNumber, toDocumentUrl, getOrCreateCustomer } from '../utils/accounts.util.js';
import { getOnboardingEmailTemplate, getRejectionEmailTemplate } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/email.util.js';

export const getOnboardingList = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM onboarding_applications
            WHERE status = 'PENDING_REVIEW'
            ORDER BY created_at DESC;`);

        const data = result.rows.map((row) => {
            const { proof_of_identity_path, proof_of_address_path, passport_photo_path, ...rest } = row;
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
};

export const approveOnboardingApplication = async (req, res) => {
    console.log("APPROVE HIT, id =", req.params.id);
    const applicationId = req.params.id;
    const client = await pool.connect();
    let application, cifId, generatedAccNO;

    try {
        await client.query("BEGIN");

        const appResult = await client.query(
            `SELECT * FROM onboarding_applications WHERE id = $1 FOR UPDATE;`,
            [applicationId]
        );
        application = appResult.rows[0];
        if (!application) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        if (application.status !== "PENDING_REVIEW") {
            await client.query("ROLLBACK");
            return res.status(409).json({ success: false, message: `Application is already ${application.status}.` });
        }

        await client.query(`UPDATE onboarding_applications SET status = 'APPROVED' WHERE id = $1;`, [applicationId]);

        cifId = await getOrCreateCustomer(client, application.user_id, application.aadhaar_no, applicationId);

        generatedAccNO = await generateAccountNumber(client);
        await client.query(
            `INSERT INTO accounts (customer_id, account_number, balance, account_type, account_scheme)
             VALUES ($1, $2, 0.00, $3, $4);`,
            [cifId, generatedAccNO, application.account_type || "SAVINGS", application.account_scheme || "NOT_ASSIGNED"]
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Failed to approve onboarding application:", error);
        return res.status(500).json({ success: false, message: "Internal server error while approving application." });
    } finally {
        client.release();
    }

    // After commit, so an email failure can't undo the approval
    console.log("Sending approval email to:", application.email_id);
    await sendEmail(
        application.email_id,
        "Onboarding Approved",
        getOnboardingEmailTemplate(application.name, cifId, generatedAccNO)
    );

    return res.status(200).json({
        success: true,
        message: "Application approved and account created.",
        data: { application_id: applicationId, cif_id: cifId, account_number: generatedAccNO },
    });
};

export const rejectOnboardingApplication = async (req, res) => {
    console.log("REJECT HIT, id =", req.params.id);
    const applicationId = req.params.id;
    try {
        const result = await pool.query(
            `UPDATE onboarding_applications
             SET status = 'REJECTED'
             WHERE id = $1 AND status = 'PENDING_REVIEW'
             RETURNING *;`,
            [applicationId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Application not found or already processed." });
        }

        const app = result.rows[0];
        console.log("Sending rejection email to:", app.email_id);
        await sendEmail(app.email_id, "Onboarding Application Rejected", getRejectionEmailTemplate(app.name));

        return res.status(200).json({ success: true, message: "Application rejected successfully.", data: app });
    } catch (error) {
        console.error("Failed to reject onboarding application:", error);
        return res.status(500).json({ success: false, message: "Internal server error while rejecting application." });
    }
};