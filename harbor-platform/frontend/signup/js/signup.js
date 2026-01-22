/**
 * Contributor Signup Flow
 */

document.addEventListener('DOMContentLoaded', () => {
    initSignupForm();
    initVerifyForm();
    initOTPInputs();
    initResendCode();
});

let userEmail = '';

/**
 * Step 1: Signup Form
 */
function initSignupForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const button = form.querySelector('.btn-primary');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate
        if (!data.terms) {
            showError('Please accept the terms and conditions.');
            return;
        }

        // Start loading
        button.classList.add('loading');
        button.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In production: create account
            // const response = await fetch('/api/auth/signup', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data),
            // });

            // Store email for verification
            userEmail = data.email;
            document.getElementById('verifyEmail').textContent = userEmail;

            // Go to step 2
            goToStep(2);
        } catch (error) {
            showError('Something went wrong. Please try again.');
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    });
}

/**
 * Step 2: Verify Form
 */
function initVerifyForm() {
    const form = document.getElementById('verifyForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const button = form.querySelector('.btn-primary');
        const inputs = form.querySelectorAll('.otp-input');
        const code = Array.from(inputs).map(i => i.value).join('');

        if (code.length !== 6) {
            showError('Please enter the complete verification code.');
            return;
        }

        // Start loading
        button.classList.add('loading');
        button.disabled = true;

        try {
            // Simulate verification
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In production: verify code
            // const response = await fetch('/api/auth/verify', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email: userEmail, code }),
            // });

            // Go to step 3
            goToStep(3);
        } catch (error) {
            showError('Invalid verification code. Please try again.');
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    });
}

/**
 * OTP Input handling
 */
function initOTPInputs() {
    const inputs = document.querySelectorAll('.otp-input');

    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Only allow digits
            e.target.value = value.replace(/\D/g, '');

            // Move to next input
            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            // Handle backspace
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

            pastedData.split('').forEach((char, i) => {
                if (inputs[i]) {
                    inputs[i].value = char;
                }
            });

            if (inputs[pastedData.length - 1]) {
                inputs[pastedData.length - 1].focus();
            }
        });
    });
}

/**
 * Resend verification code
 */
function initResendCode() {
    const resendLink = document.getElementById('resendCode');
    if (!resendLink) return;

    resendLink.addEventListener('click', async (e) => {
        e.preventDefault();

        resendLink.textContent = 'Sending...';
        resendLink.style.pointerEvents = 'none';

        try {
            // Simulate resend
            await new Promise(resolve => setTimeout(resolve, 1000));

            resendLink.textContent = 'Code sent!';

            setTimeout(() => {
                resendLink.textContent = 'Resend';
                resendLink.style.pointerEvents = 'auto';
            }, 3000);
        } catch (error) {
            resendLink.textContent = 'Failed. Try again.';
            resendLink.style.pointerEvents = 'auto';
        }
    });
}

/**
 * Navigate to step
 */
function goToStep(stepNum) {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');

        if (index + 1 < stepNum) {
            step.classList.add('completed');
        } else if (index + 1 === stepNum) {
            step.classList.add('active');
        }
    });

    // Show correct form step
    document.querySelectorAll('.form-step').forEach((formStep, index) => {
        formStep.classList.remove('active');

        if (index + 1 === stepNum) {
            formStep.classList.add('active');
        }
    });
}

/**
 * Show error message
 */
function showError(message) {
    let errorEl = document.querySelector('.form-error');
    const activeStep = document.querySelector('.form-step.active');

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
    }

    errorEl.textContent = message;

    const h2 = activeStep.querySelector('h2');
    h2.parentNode.insertBefore(errorEl, h2.nextSibling.nextSibling);

    setTimeout(() => errorEl.remove(), 5000);
}
