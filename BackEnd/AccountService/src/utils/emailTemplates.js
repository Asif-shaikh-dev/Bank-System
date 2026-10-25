

export const getOnboardingEmailTemplate = (name, cifId, generatedAccNO) => {
    return `<div style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 30px; margin: 0; width: 100%;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
    <tr>
      <td style="background-color: #1a365d; padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Onboarding Successful</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px; color: #333333; line-height: 1.6;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">Dear <span style="font-weight: 600; color: #1a365d;">${name}</span>,</p>
        <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555;">Congratulations! Your onboarding has been successfully completed. Your new account details are ready below:</p>
        <table width="100%" style="background-color: #f8fafc; border-left: 4px solid #1a365d; border-collapse: collapse; margin-bottom: 30px;">
          <tr>
            <td style="padding: 15px 20px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 600;">CIF ID</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">${cifId}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 20px 15px 20px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 600;">Account Number</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">${generatedAccNO}</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 16px; color: #555555;">Thank you for choosing our bank. We are thrilled to have you with us.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">This is an automated operational notification. Please do not reply to this email.</p>
      </td>
    </tr>
  </table>
</div>`;
}


export const getPendingReviewEmailTemplate = (name, applicationId) => `
<p>Dear ${name},</p>
<p>Thank you for applying. Your onboarding application (Ref: ${applicationId}) has been received successfully.</p>
<p>It is now awaiting review by the bank. We will email you once a decision is made.</p>`;

export const getRejectionEmailTemplate = (name) => `
<p>Dear ${name},</p>
<p>We regret to inform you that your onboarding application has been rejected.</p>
<p>Thank you for your interest in our services.</p>`;
