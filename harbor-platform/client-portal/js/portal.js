/**
 * Client Portal JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initSearch();
});

/**
 * Filter handling
 */
function initFilters() {
    const checkboxes = document.querySelectorAll('.filter-option input');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // In production: filter datasets via API
            console.log('Filter changed:', checkbox.parentElement.textContent.trim());
            applyFilters();
        });
    });
}

function applyFilters() {
    const checkedFilters = [];
    document.querySelectorAll('.filter-option input:checked').forEach(cb => {
        checkedFilters.push(cb.parentElement.textContent.trim());
    });
    console.log('Active filters:', checkedFilters);

    // TODO: Call API with filters
}

/**
 * Search
 */
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query) {
                searchDatasets(query);
            }
        }, 300);
    });
}

async function searchDatasets(query) {
    console.log('Searching:', query);

    // In production: call search API
    // const response = await fetch(`/api/client/datasets/search?q=${encodeURIComponent(query)}`);
}

/**
 * Load datasets from API (placeholder)
 */
async function loadDatasets(page = 1, filters = {}) {
    try {
        // const response = await fetch(`/api/client/datasets?page=${page}`);
        // const data = await response.json();
        // renderDatasets(data.datasets);
    } catch (error) {
        console.error('Failed to load datasets:', error);
    }
}

function renderDatasets(datasets) {
    const grid = document.querySelector('.dataset-grid');
    if (!grid) return;

    grid.innerHTML = datasets.map(ds => `
        <article class="dataset-card" onclick="location.href='dataset.html?id=${ds.id}'">
            <div class="dataset-thumbnail">
                <div class="thumbnail-placeholder">${ds.icon || '📦'}</div>
                <span class="dataset-type">${ds.type}</span>
            </div>
            <div class="dataset-info">
                <h3>${ds.name}</h3>
                <p>${ds.description}</p>
                <div class="dataset-meta">
                    <span class="meta-item">📦 ${formatNumber(ds.itemCount)} items</span>
                    <span class="meta-item">🏷️ ${formatNumber(ds.annotationCount)} annotations</span>
                </div>
                <div class="dataset-tags">
                    ${ds.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
