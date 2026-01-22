/**
 * HARBOR Blog JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initCategoryFilter();
    initNewsletter();
    initPostCards();
});

/**
 * Category filtering
 */
function initCategoryFilter() {
    const buttons = document.querySelectorAll('.category-btn');
    const posts = document.querySelectorAll('.posts-grid .post-card');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;

            // Update active button
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter posts
            posts.forEach(post => {
                if (category === 'all' || post.dataset.category === category) {
                    post.style.display = 'block';
                    post.style.animation = 'fadeIn 0.3s ease';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Newsletter signup
 */
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.querySelector('input[type="email"]').value;
        const button = form.querySelector('button');

        // Disable button
        button.disabled = true;
        button.textContent = 'Subscribing...';

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Success
            button.textContent = 'Subscribed ✓';
            button.style.background = '#00cc88';
            form.querySelector('input').value = '';

            setTimeout(() => {
                button.textContent = 'Subscribe';
                button.style.background = '';
                button.disabled = false;
            }, 3000);
        } catch (error) {
            button.textContent = 'Error. Try again.';
            button.style.background = '#ff4466';
            button.disabled = false;
        }
    });
}

/**
 * Post card click handling
 */
function initPostCards() {
    const cards = document.querySelectorAll('.post-card');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't navigate if clicking a link
            if (e.target.tagName === 'A') return;

            const link = card.querySelector('.read-more');
            if (link) {
                window.location.href = link.href;
            }
        });
    });
}

/**
 * Load more posts (simulated)
 */
document.getElementById('loadMore')?.addEventListener('click', async function () {
    this.textContent = 'Loading...';
    this.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production: fetch more posts from API
    this.textContent = 'No More Posts';
    this.disabled = true;
});

// CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
