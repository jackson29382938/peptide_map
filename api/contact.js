// Vercel serverless function for contact form
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { email, message } = req.body;
        
        // Validate required fields
        if (!email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        
        // Validate message length
        if (message.trim().length < 10) {
            return res.status(400).json({ error: 'Message must be at least 10 characters long' });
        }
        
        // Recipient email
        const to = 'peptidemap@proton.me';
        
        // Email subject
        const subject = 'Contact Form Submission from Peptide Map';
        
        // Email body
        const emailBody = `New contact form submission from Peptide Map

From: ${email}
Date: ${new Date().toISOString()}

Message:
${message}

---
This email was sent from the contact form on the Peptide Map website.`;
        
        // Check if SMTP is configured
        if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
            console.warn('SMTP not configured - email sending will likely fail');
            return res.status(500).json({ 
                error: 'Email service not configured. Please contact the administrator.',
                details: process.env.VERCEL_ENV === 'development' ? 
                    'SMTP_HOST and SMTP_USER environment variables are not set. See VERCEL_EMAIL_SETUP.md for configuration instructions.' : 
                    undefined
            });
        }
        
        // Create transporter
        // For Vercel, you can use environment variables for SMTP config
        // Default to using SendGrid, Gmail, or other SMTP service
        const transporterConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        };
        
        // Only add auth if credentials are provided
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporterConfig.auth = {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            };
        }
        
        const transporter = nodemailer.createTransport(transporterConfig);
        
        // Verify transporter configuration (optional, but helpful for debugging)
        try {
            await transporter.verify();
            console.log('SMTP server is ready to send emails');
        } catch (verifyError) {
            console.error('SMTP verification failed:', verifyError);
            // Continue anyway - verification might fail but sending could still work
        }
        
        // Send email
        const mailOptions = {
            from: process.env.SMTP_FROM || email, // Use SMTP_FROM env var or user's email
            replyTo: email,
            to: to,
            subject: subject,
            text: emailBody,
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('Error sending contact email:', error);
        console.error('Error stack:', error.stack);
        
        // Provide more detailed error information for debugging
        const errorDetails = {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        };
        
        console.error('Error details:', JSON.stringify(errorDetails, null, 2));
        
        // If SMTP fails, you might want to use a service like SendGrid API, Resend, etc.
        // For now, return error
        return res.status(500).json({ 
            error: 'Failed to send email. Please try again later.',
            details: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development' 
                ? {
                    message: error.message,
                    code: error.code,
                    hint: !process.env.SMTP_HOST ? 'SMTP_HOST environment variable not set' : 
                          !process.env.SMTP_USER || !process.env.SMTP_PASS ? 'SMTP credentials not configured' : 
                          'Check SMTP server configuration'
                } 
                : undefined
        });
    }
};

