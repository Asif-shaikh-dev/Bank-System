import transporter from "../config/mail.js";

export const sendEmail = async ({
    to,
    subject,
    html,
}) => {
    try {
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            html,
        });

        console.log(`Email sent successfully to ${to}`);
    } catch (err) {
        console.error(err);
        throw err;
    }
};