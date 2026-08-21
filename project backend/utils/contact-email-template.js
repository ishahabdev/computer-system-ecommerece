// Contact-form email HTML template with blue header
// Use this inside your sendMail() call as the `html` field

// Visitor-supplied text is escaped so it can never break or inject markup.
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const contactEmailTemplate = ({ name, email, message, receivedAt }) => `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

  <!-- Blue Header -->
  <div style="background-color: #2196F3; padding: 25px 30px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">
      New Contact Message
    </h1>
  </div>

  <!-- Body -->
  <div style="padding: 30px; background-color: #ffffff;">
    <p style="font-size: 15px; color: #333333; margin-top: 0;">
      Someone just sent a message from the Contact Us page.
    </p>

    <table style="width: 100%; font-size: 14px; color: #333333; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; color: #777777; width: 90px;">Name</td>
        <td style="padding: 8px 0; font-weight: bold;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #777777;">Email</td>
        <td style="padding: 8px 0; font-weight: bold;">
          <a href="mailto:${escapeHtml(email)}" style="color: #2196F3; text-decoration: none;">${escapeHtml(email)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #777777;">Received</td>
        <td style="padding: 8px 0;">${escapeHtml(receivedAt)}</td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #777777; margin-bottom: 8px;">Message</p>
    <div style="background-color: #f0f7ff; border: 1px dashed #2196F3; border-radius: 8px; padding: 16px; font-size: 15px; color: #333333; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>

    <p style="font-size: 14px; color: #555555; margin-top: 25px;">
      Reply directly to this email to answer the customer.
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f5f5f5; padding: 15px 30px; text-align: center;">
    <p style="font-size: 12px; color: #999999; margin: 0;">
      Sent automatically from your store's Contact Us page.
    </p>
  </div>

</div>
`;

export default contactEmailTemplate;
