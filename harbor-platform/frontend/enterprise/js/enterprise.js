/**
 * Enterprise Demo Form
 */

document.addEventListener('DOMContentLoaded', () => {
    initForm();
});

function initForm() {
    const form = document.getElementById('demoForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const button = form.querySelector('.btn-submit');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate email domain
        const email = data.email;
        if (isFreeEmail(email)) {
            showError('Please use your work email address.');
            return;
        }

        // Start loading
        button.classList.add('loading');
        button.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In production: call backend
            // const response = await fetch('/api/demo-request', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data),
            // });

            // Redirect to thank you page
            window.location.href = 'thank-you.html?name=' + encodeURIComponent(data.firstName);
        } catch (error) {
            showError('Something went wrong. Please try again.');
            button.classList.remove('loading');
            button.disabled = false;
        }
    });
}

/**
 * Check if email is from a free provider
 */
function isFreeEmail(email) {
    const freeProviders = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return freeProviders.includes(domain);
}

/**
 * Show error message
 */
function showError(message) {
    let errorEl = document.querySelector('.form-error');

    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.style.cssText = `
            background: rgba(255, 68, 102, 0.1);
            border: 1px solid #ff4466;
            color: #ff4466;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 16px;
        `;
        document.querySelector('.demo-form').prepend(errorEl);
    }

    errorEl.textContent = message;

    setTimeout(() => errorEl.remove(), 5000);
}
