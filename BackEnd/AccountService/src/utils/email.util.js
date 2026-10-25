import axios from 'axios';

export const sendEmail = async (email, subject, htmlContent) => {
    const url = `${process.env.EMAIL_SERVICE_URL}/email/sendEmail`;
    try {
        await axios.post(url, { email, subject, htmlContent });
        console.log(`Email "${subject}" sent to ${email}`);
        return true;
    } catch (err) {
        console.error(
            `Email "${subject}" to ${email} failed via ${url}:`,
            err.response?.status,
            err.response?.data || err.message
        );
        return false; // never throws, so an email failure can't break approve/reject
    }
};