// Contact form: posts to the Vercel serverless function (/api/contact).
(function () {
  'use strict';

  const ENDPOINT = '/api/contact';
  const MIN_MESSAGE = 10;
  const MAX_MESSAGE = 5000;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function init() {
    const form = document.getElementById('contact-form');
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = document.getElementById('contact-submit');
    const status = document.getElementById('contact-status');
    const honeypot = document.getElementById('contact-website');
    let hideTimer = null;

    messageInput.maxLength = MAX_MESSAGE;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const STYLES = {
      error: { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444' },
      success: { bg: 'rgba(34, 197, 94, 0.12)', border: '#22c55e' },
      info: { bg: 'rgba(59, 130, 246, 0.12)', border: '#3b82f6' }
    };

    function showStatus(text, type) {
      clearTimeout(hideTimer);
      const style = STYLES[type] || STYLES.info;
      status.textContent = text;
      status.style.display = 'block';
      status.style.background = style.bg;
      status.style.border = `1px solid ${style.border}`;
      status.style.color = 'var(--text-primary)';
      if (type === 'success') {
        hideTimer = setTimeout(() => { status.style.display = 'none'; }, 6000);
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const message = messageInput.value.trim();

      if (!email || !message) {
        showStatus('Please fill in all fields.', 'error');
        return;
      }
      if (!EMAIL_RE.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }
      if (message.length < MIN_MESSAGE) {
        showStatus(`Your message must be at least ${MIN_MESSAGE} characters long.`, 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      showStatus('Sending your message...', 'info');

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, message, website: honeypot ? honeypot.value : '' })
        });

        let data = {};
        try { data = await response.json(); } catch (_) { /* non-JSON error body */ }

        if (response.ok && data.success) {
          showStatus("Message sent! We'll get back to you soon.", 'success');
          form.reset();
        } else {
          showStatus(data.error || 'Failed to send message. Please try again later.', 'error');
        }
      } catch (err) {
        console.error('Error sending contact form:', err);
        showStatus('Network error. Please check your connection and try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
