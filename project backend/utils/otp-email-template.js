// OTP email HTML template with blue header
// Use this inside your sendMail() call as the `html` field

const otpEmailTemplate = (otp) => `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  
  <!-- Blue Header -->
  <div style="background-color: #2196F3; padding: 25px 30px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">
      Your OTP Code
    </h1>
  </div>

  <!-- Body -->
  <div style="padding: 30px; background-color: #ffffff;">
    <p style="font-size: 15px; color: #333333; margin-top: 0;">
      Hello,
    </p>
    <p style="font-size: 15px; color: #333333;">
      Your One-Time Password (OTP) for account verification is:
    </p>

    <div style="text-align: center; margin: 25px 0;">
      <span style="display: inline-block; background-color: #f0f7ff; color: #2196F3; font-size: 30px; font-weight: bold; letter-spacing: 6px; padding: 14px 28px; border-radius: 8px; border: 1px dashed #2196F3;">
        ${otp}
      </span>
    </div>

    <p style="font-size: 14px; color: #555555;">
      This OTP is valid for <strong>2 minutes</strong>. Please do not share this code with anyone.
    </p>
    <p style="font-size: 14px; color: #555555;">
      If you didn't request this code, please ignore this email.
    </p>

    <p style="font-size: 14px; color: #999999; margin-top: 30px;">
      Thank you for using our service!
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f5f5f5; padding: 15px 30px; text-align: center;">
    <p style="font-size: 12px; color: #999999; margin: 0;">
      This is an automated email, please do not reply.
    </p>
  </div>

</div>
`;

export default otpEmailTemplate;