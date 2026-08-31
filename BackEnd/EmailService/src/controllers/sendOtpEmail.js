import { sendEmail } from "../Services/emailService.js";

export const sendOtpEmail = async (req, res) => {

    const { email, otp } = req.body;

    try {

        await sendEmail({
            to: email,
            subject: "OTP Verification",
            html: `
                <h2>Your OTP</h2>
                <h1>${otp}</h1>
                <p>Expires in 5 minutes.</p>
            `
        });

        res.json({
            success: true,
            message: "Email Sent"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};