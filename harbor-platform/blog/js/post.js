/**
 * Blog Post JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initShareButtons();
    initCopyLink();
});

/**
 * Share buttons
 */
function initShareButtons() {
    const twitterBtn = document.querySelector('.share-btn.twitter');
    const linkedinBtn = document.querySelector('.share-btn.linkedin');

    const title = document.getElementById('postTitle')?.textContent || document.title;
    const url = window.location.href;

    if (twitterBtn) {
        twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        twitterBtn.target = '_blank';
    }

    if (linkedinBtn) {
        linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        linkedinBtn.target = '_blank';
    }
}

/**
 * Copy link button
 */
function initCopyLink() {
    const copyBtn = document.querySelector('.share-btn.copy');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            await navigator.clipboard.writeText(window.location.href);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Link';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
}

/**
 * In production: Load post content from API based on slug
 */
function loadPost() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) return;

    // Fetch post from API
    // fetch(`/api/blog/posts/${slug}`)
    //     .then(res => res.json())
    //     .then(post => renderPost(post));
}
