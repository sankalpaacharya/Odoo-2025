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
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .credentials {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .credential-item {
          margin: 10px 0;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .credential-label {
          font-weight: bold;
          color: #667eea;
          display: block;
          margin-bottom: 5px;
        }
        .credential-value {
          font-size: 16px;
          font-family: 'Courier New', monospace;
          color: #333;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
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
