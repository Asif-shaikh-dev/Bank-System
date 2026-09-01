import { sendEmail } from "../Services/emailService.js";

export const sendCustomHtmlEmail = async (req, res) => {
  const { email, subject, htmlContent } = req.body;

  try {
    await sendEmail({
      to: email,
      subject: subject,
      html: htmlContent
    });

    res.json({ 
      success: true, 
      message: "Custom HTML email sent successfully" 
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
