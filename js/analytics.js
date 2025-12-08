// Analytics Dashboard Module
// Displays aggregated public data

(function () {
    'use strict';

    // Mock Data
    const MOCK_DATA = {
        topPeptides: [
            { name: 'BPC-157', searches: 15420, trend: '+12%' },
            { name: 'TB-500', searches: 8940, trend: '+8%' },
            { name: 'CJC-1295', searches: 6200, trend: '+5%' },
            { name: 'Ipamorelin', searches: 5800, trend: '+3%' },
            { name: 'GHK-Cu', searches: 4100, trend: '+15%' }
        ],
        topInjuries: [
            { name: 'Tendonitis', count: 3200 },
            { name: 'Rotator Cuff', count: 2800 },
            { name: 'Knee ACL/MCL', count: 2100 },
            { name: 'Lower Back', count: 1800 },
            { name: 'Tennis Elbow', count: 1500 }
        ],
        communityStats: {
            totalSearches: '1.2M',
            activeUsers: '45k',
            verifiedReviews: '12k'
        }
    };

    let analyticsPanel = null;
    let isInitialized = false;

    function createAnalyticsPanel() {
        if (document.getElementById('analytics-panel')) return;

        analyticsPanel = document.createElement('div');
        analyticsPanel.id = 'analytics-panel';
        analyticsPanel.className = 'collapsed'; // Start collapsed

        // Basic styling handled by CSS classes shared with other panels
        analyticsPanel.innerHTML = `
            <div id="analytics-drag-handle" title="Drag to adjust panel width"></div>
            <div class="studies-header">
                <h2 class="studies-title">📈 Public Analytics</h2>
                <div class="studies-meta">
                    <span>Aggregated Community Insights</span>
                </div>
            </div>
            <div class="studies-list analytics-content">
                <div class="analytics-card">
                    <h3>Community Overview</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-val">${MOCK_DATA.communityStats.totalSearches}</span>
                            <span class="stat-label">Total Searches</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-val">${MOCK_DATA.communityStats.activeUsers}</span>
                            <span class="stat-label">Active Users</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-val">${MOCK_DATA.communityStats.verifiedReviews}</span>
                            <span class="stat-label">Verified Reviews</span>
                        </div>
                    </div>
                </div>

                <div class="analytics-card">
                    <h3>🔥 Trending Peptides</h3>
                    <ul class="analytics-list">
                        ${MOCK_DATA.topPeptides.map((p, i) => `
                            <li>
                                <span class="rank">#${i + 1}</span>
                                <span class="name">${p.name}</span>
                                <span class="count">${p.searches.toLocaleString()}</span>
                                <span class="trend">${p.trend}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="analytics-card">
                    <h3>🤕 Common Injuries</h3>
                    <div class="chart-bars">
                        ${MOCK_DATA.topInjuries.map(inj => {
            const max = MOCK_DATA.topInjuries[0].count;
            const pct = (inj.count / max) * 100;
            return `
                                <div class="bar-row">
                                    <div class="bar-label">${inj.name}</div>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${pct}%"></div>
                                    </div>
                                    <div class="bar-val">${inj.count}</div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(analyticsPanel);

        // Setup Drag Handle (Simple width adjust)
        // ... (reuse existing drag logic or simple implementation)

        setupToggle();
    }

    function setupToggle() {
        const toggleBtn = document.getElementById('analytics-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel(analyticsPanel, toggleBtn);
            }
        });
    }

    function init() {
        if (isInitialized) return;
        createAnalyticsPanel();
        isInitialized = true;
        console.log('📈 Analytics Dashboard initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export
    window.PeptideAnalytics = {
        toggle: () => {
            if (analyticsPanel && typeof window.togglePanel === 'function') {
                const btn = document.getElementById('analytics-toggle');
                window.togglePanel(analyticsPanel, btn);
            }
        }
    };

})();
