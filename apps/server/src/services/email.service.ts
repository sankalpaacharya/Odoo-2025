import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface NewEmployeeEmailData {
  employeeName: string;
  email: string;
  employeeCode: string;
  temporaryPassword: string;
  companyName: string;
}

// Create reusable transporter
async function getTransporter() {
  // Check if Gmail credentials are configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log("📧 Using Gmail SMTP service");
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to ethereal for development/testing
  console.log("📧 Using Ethereal test account (no SMTP configured)");
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      console.log("⚠️  Email transporter not configured");
      return { success: false, error: "Email not configured" };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"WorkZen HR" <noreply@workzen.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("✅ Email sent:", info.messageId);

    // Preview URL for ethereal
    if (process.env.NODE_ENV !== "production") {
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendNewEmployeeEmail(data: NewEmployeeEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          background: #1a1a1a;
          color: #ffffff;
          padding: 30px;
          text-align: center;
          border-bottom: 3px solid #000000;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 30px 0;
        }
        .content h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-top: 0;
        }
        .content h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-top: 24px;
        }
        .content p {
          color: #4a4a4a;
          margin: 12px 0;
        }
        .credentials {
          background: #f8f8f8;
          padding: 24px;
          margin: 24px 0;
          border: 2px solid #e0e0e0;
          border-left: 4px solid #1a1a1a;
        }
        .credentials h3 {
          margin-top: 0;
          margin-bottom: 16px;
        }
        .credential-item {
          margin: 12px 0;
          padding: 12px;
          background: #ffffff;
          border: 1px solid #e0e0e0;
        }
        .credential-label {
          font-weight: 600;
          color: #1a1a1a;
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .credential-value {
          font-size: 16px;
          font-family: 'Courier New', Consolas, monospace;
          color: #1a1a1a;
          font-weight: 500;
        }
        .warning {
          background: #f8f8f8;
          border: 2px solid #1a1a1a;
          padding: 16px;
          margin: 24px 0;
        }
        .warning strong {
          display: block;
          margin-bottom: 8px;
          color: #1a1a1a;
        }
        .warning p {
          margin: 0;
          color: #4a4a4a;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          color: #737373;
          font-size: 12px;
        }
        .footer p {
          color: #737373;
          margin: 8px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: #1a1a1a;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          margin: 24px 0;
          border: 2px solid #1a1a1a;
          transition: all 0.2s ease;
        }
        .button:hover {
          background: #ffffff;
          color: #1a1a1a;
        }
        ol {
          color: #4a4a4a;
          padding-left: 24px;
        }
        ol li {
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to ${data.companyName}! 🎉</h1>
      </div>
      <div class="content">
        <h2>Hello ${data.employeeName}!</h2>
        <p>
          We're excited to have you join our team! Your employee account has been created successfully.
        </p>
        
        <div class="credentials">
          <h3>Your Login Credentials</h3>
          
          <div class="credential-item">
            <span class="credential-label">Employee Code:</span>
            <span class="credential-value">${data.employeeCode}</span>
          </div>
          
          <div class="credential-item">
            <span class="credential-label">Email:</span>
            <span class="credential-value">${data.email}</span>
          </div>
          
          <div class="credential-item">
            <span class="credential-label">Temporary Password:</span>
            <span class="credential-value">${data.temporaryPassword}</span>
          </div>
        </div>
        
        <div class="warning">
          <strong>⚠️ Important Security Notice:</strong>
          <p>
            Please change your password immediately after your first login. 
            Your temporary password is only valid for initial access.
          </p>
        </div>
        
        <center>
          <a href="http://localhost:3001/login" class="button">
            Login to Your Account
          </a>
        </center>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Click the login button above or visit the employee portal</li>
          <li>Use your employee code and temporary password to log in</li>
          <li>Change your password to something secure</li>
          <li>Complete your profile information</li>
        </ol>
        
        <p>
          If you have any questions or need assistance, please don't hesitate to contact the HR department.
        </p>
        
        <div class="footer">
          <p>
            This is an automated email from ${data.companyName} HR System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to ${data.companyName}!

Hello ${data.employeeName},

We're excited to have you join our team! Your employee account has been created successfully.

Your Login Credentials:
- Employee Code: ${data.employeeCode}
- Email: ${data.email}
- Temporary Password: ${data.temporaryPassword}

⚠️ IMPORTANT: Please change your password immediately after your first login.

Login at: ${process.env.APP_URL || "http://localhost:3000"}/login

Next Steps:
1. Visit the employee portal
2. Use your employee code and temporary password to log in
3. Change your password to something secure
4. Complete your profile information

If you have any questions, please contact the HR department.

---
This is an automated email from ${data.companyName} HR System.
Please do not reply to this email.
  `;

  return sendEmail({
    to: data.email,
    subject: `Welcome to ${data.companyName} - Your Account Details`,
    html,
    text,
  });
}
