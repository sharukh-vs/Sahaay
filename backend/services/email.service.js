const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter.
 * Uses environment-configured SMTP credentials.
 * Falls back to Ethereal (test) if no SMTP config is present.
 */
const getTransporter = async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    // Development: create a test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('[Email] Using Ethereal test account:', testAccount.user);
    return transporter;
};

const FROM_ADDRESS = process.env.EMAIL_FROM || '"Sahaay" <noreply@sahaay.in>';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
        text,
    });
    if (process.env.NODE_ENV !== 'production') {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log('[Email] Preview URL:', preview);
    }
    return info;
};

// ─── Email Templates ───────────────────────────────────────────────────────────

const sendVerificationEmail = async (user, token) => {
    const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Verify your Sahaay account',
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto">
                <h2 style="color:#6366f1">Welcome to Sahaay, ${user.name}!</h2>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="${verifyUrl}"
                   style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
                   Verify Email
                </a>
                <p style="color:#888;margin-top:20px">This link expires in 24 hours.</p>
                <p style="color:#888">If you didn't create a Sahaay account, please ignore this email.</p>
            </div>
        `,
        text: `Verify your Sahaay account: ${verifyUrl}`,
    });
};

const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Reset your Sahaay password',
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto">
                <h2 style="color:#6366f1">Password Reset Request</h2>
                <p>Hi ${user.name}, we received a request to reset your password.</p>
                <a href="${resetUrl}"
                   style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
                   Reset Password
                </a>
                <p style="color:#888;margin-top:20px">This link expires in 1 hour.</p>
                <p style="color:#888">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            </div>
        `,
        text: `Reset your Sahaay password: ${resetUrl}`,
    });
};

const sendWelcomeEmail = async (user) => {
    await sendEmail({
        to: user.email,
        subject: 'Welcome to Sahaay!',
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto">
                <h2 style="color:#6366f1">You're in, ${user.name}! 🎉</h2>
                <p>Your Sahaay account has been verified. You can now:</p>
                <ul>
                    <li>Search and book local services</li>
                    <li>Post service requests</li>
                    <li>Connect with verified service providers</li>
                </ul>
                <a href="${APP_URL}/home"
                   style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
                   Explore Services
                </a>
            </div>
        `,
        text: `Welcome to Sahaay, ${user.name}! Explore services at ${APP_URL}/home`,
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
};
