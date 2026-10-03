// Vercel serverless function for the contact form
const nodemailer = require('nodemailer');

const RECIPIENT = process.env.CONTACT_TO || 'bodymappeptide@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 5000;

// Best-effort per-instance rate limit (serverless instances are short lived, so this only
// blunts bursts; use an external store or Vercel's WAF rules for hard limits).
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map();

function rateLimited(ip) {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 500) {
        for (const [key, times] of hits) {
            if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
        }
    }
    return recent.length > MAX_PER_WINDOW;
}

function allowedOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return null;
    const allowed = (process.env.CONTACT_ALLOWED_ORIGINS || 'https://peptide-map.vercel.app')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    let host = '';
    try { host = new URL(origin).host; } catch (_) { return null; }
    // Same-origin requests (including preview deployments) and the configured origins
    if (host === req.headers.host || allowed.includes(origin)) return origin;
    return null;
}

module.exports = async (req, res) => {
    const origin = allowedOrigin(req);
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    // Honeypot: real visitors never fill this in. Pretend success so bots don't adapt.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    }

    if (!email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }
    if (message.length < MIN_MESSAGE) {
        return res.status(400).json({ error: `Message must be at least ${MIN_MESSAGE} characters long` });
    }
    if (message.length > MAX_MESSAGE) {
        return res.status(400).json({ error: `Message must be at most ${MAX_MESSAGE} characters long` });
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
        (req.socket && req.socket.remoteAddress) || 'unknown';
    if (rateLimited(ip)) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: 'Too many messages. Please wait a minute and try again.' });
    }

    if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
        console.warn('SMTP not configured - contact email cannot be sent');
        return res.status(500).json({ error: 'Email service not configured. Please try again later.' });
    }

    try {
        const transporterConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true'
        };
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporterConfig.auth = { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS };
        }
        const transporter = nodemailer.createTransport(transporterConfig);

        // Send from the authenticated account (mail providers reject or spam-flag forged From
        // addresses) and let the recipient reply straight to the visitor.
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || RECIPIENT;
        await transporter.sendMail({
            from,
            replyTo: email,
            to: RECIPIENT,
            subject: 'Contact Form Submission from Peptide Map',
            text: `New contact form submission from Peptide Map

From: ${email}
Date: ${new Date().toISOString()}

Message:
${message}

---
This email was sent from the contact form on the Peptide Map website.`
        });

        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        // Log details server-side only; never return SMTP internals to the client.
        console.error('Error sending contact email:', {
            message: error.message,
            code: error.code,
            responseCode: error.responseCode
        });
        return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
};
