/**
 * HARBOR Dashboard JavaScript
 * Navigation and interactive functionality
 */

// ============================================
// NAVIGATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    initTabs();
    initAnimations();
});

/**
 * Initialize sidebar navigation
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const sectionId = item.dataset.section;

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                }
            });

            // Update page title
            const sectionName = item.querySelector('span:last-child').textContent;
            pageTitle.textContent = sectionName;
        });
    });
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const globalSearch = document.getElementById('globalSearch');
    const ragSearch = document.getElementById('ragSearch');

    if (globalSearch) {
        globalSearch.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            console.log('Global search:', query);
            // TODO: Implement search
        }, 300));
    }

    if (ragSearch) {
        ragSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performRAGSearch(e.target.value);
            }
        });
    }
}

/**
 * Perform RAG search
 */
async function performRAGSearch(query) {
    console.log('RAG search:', query);

    try {
        // Call Cognee service
        const response = await fetch('http://localhost:8001/graph/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                depth: 2,
                limit: 20
            })
        });

        if (response.ok) {
            const data = await response.json();
            renderGraphResults(data);
        }
    } catch (error) {
        console.error('RAG search failed:', error);
        showNotification('Search service unavailable', 'error');
    }
}

/**
 * Render graph search results
 */
function renderGraphResults(data) {
    const container = document.querySelector('.graph-container');
    if (!container) return;

    if (data.entities.length === 0) {
        container.innerHTML = `
            <div class="graph-placeholder">
                <span class="graph-icon">🔍</span>
                <p>No results found</p>
            </div>
        `;
        return;
    }

    // Simple visualization (in production, use D3.js or vis.js)
    container.innerHTML = `
        <div class="results-list" style="padding: 20px; width: 100%; overflow-y: auto; max-height: 100%;">
            ${data.entities.map(entity => `
                <div class="result-item" style="padding: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    <strong>${entity.entity_type}</strong>: ${entity.content}
                    <br><small style="color: #666;">Score: ${(data.relevance_scores[entity.id] * 100).toFixed(1)}%</small>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Initialize tabs
 */
function initTabs() {
    const tabGroups = document.querySelectorAll('.tabs');

    tabGroups.forEach(group => {
        const tabs = group.querySelectorAll('.tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // TODO: Filter content based on tab
            });
        });
    });
}

/**
 * Initialize animations
 */
function initAnimations() {
    // Animate stat cards on load
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Animate bars on load
    const bars = document.querySelectorAll('.chart-bars .bar');
    bars.forEach((bar, index) => {
        const height = bar.style.getPropertyValue('--height');
        bar.style.height = '0';

        setTimeout(() => {
            bar.style.transition = 'height 0.5s ease';
            bar.style.height = height;
        }, 300 + index * 50);
    });
}

// ============================================
// API CALLS
// ============================================

/**
 * Fetch dashboard stats
 */
async function fetchStats() {
    try {
        const response = await fetch('/api/v1/stats');
        if (response.ok) {
            const stats = await response.json();
            updateStats(stats);
        }
    } catch (error) {
        console.error('Failed to fetch stats:', error);
    }
}

/**
 * Update stats display
 */
function updateStats(stats) {
    if (stats.datasets) {
        document.getElementById('totalDatasets').textContent = stats.datasets;
    }
    if (stats.media) {
        document.getElementById('totalMedia').textContent = formatNumber(stats.media);
    }
    if (stats.annotations) {
        document.getElementById('totalAnnotations').textContent = formatNumber(stats.annotations);
    }
    if (stats.revenue) {
        document.getElementById('totalRevenue').textContent = formatCurrency(stats.revenue);
    }
}

/**
 * Fetch ingestion jobs
 */
async function fetchIngestionJobs() {
    try {
        const response = await fetch('/api/ingestion/jobs');
        if (response.ok) {
            const jobs = await response.json();
            renderJobs(jobs.data);
        }
    } catch (error) {
        console.error('Failed to fetch jobs:', error);
    }
}

/**
 * Fetch annotation tasks
 */
async function fetchTasks() {
    try {
        const response = await fetch('/api/annotation/tasks');
        if (response.ok) {
            const tasks = await response.json();
            renderTasks(tasks.data);
        }
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
    }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
        notation: 'compact'
    }).format(amount);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#ff4466' : type === 'success' ? '#00cc88' : '#00d4ff'};
        color: #000;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// QUICK ACTION BUTTON
// ============================================

document.getElementById('quickAction')?.addEventListener('click', () => {
    // Show upload modal
    showNotification('Upload modal coming soon', 'info');
});
