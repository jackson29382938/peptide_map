// Peptide Comparison Tool Module
// Side-by-side comparison of 2-3 peptides

(function () {
    'use strict';

    const MAX_COMPARE = 3;
    let selectedPeptides = [];
    let comparisonPanel = null;
    let isInitialized = false;

    // Get peptide data from global database
    function getPeptideData(peptideId) {
        if (typeof window.PEPTIDES_DATABASE !== 'undefined') {
            return window.PEPTIDES_DATABASE[peptideId] || null;
        }
        return null;
    }

    // Get all available peptides
    function getAllPeptides() {
        if (typeof window.PEPTIDES_DATABASE !== 'undefined') {
            return Object.keys(window.PEPTIDES_DATABASE).map(id => ({
                id,
                name: window.PEPTIDES_DATABASE[id].fullName || id
            }));
        }
        return [];
    }

    // Create the comparison panel
    function createComparisonPanel() {
        if (document.getElementById('compare-panel')) return;

        // Create panel
        comparisonPanel = document.createElement('div');
        comparisonPanel.id = 'compare-panel';
        comparisonPanel.className = 'collapsed';
        comparisonPanel.innerHTML = `
            <div id="compare-drag-handle" title="Drag to adjust panel width"></div>
            <div class="studies-header">
                <h2 class="studies-title">⚖️ Peptide Comparison</h2>
                <div class="studies-meta">
                    <span>Select up to ${MAX_COMPARE} peptides to compare side-by-side</span>
                </div>
            </div>
            <div id="compare-container" class="studies-list">
                <div class="compare-selectors"></div>
                <div class="compare-table-container"></div>
            </div>
        `;
        document.body.appendChild(comparisonPanel);

        // Get toggle button
        const toggleBtn = document.getElementById('compare-toggle');
        if (!toggleBtn) {
            console.warn('Compare toggle button not found');
            return;
        }

        // Event listener for toggle
        toggleBtn.addEventListener('click', () => {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel(comparisonPanel, toggleBtn);
            }
        });

        // Render initial state
        renderSelectors();
    }

    // Render peptide selectors
    function renderSelectors() {
        const container = document.querySelector('.compare-selectors');
        if (!container) return;

        const peptides = getAllPeptides();

        let html = '<div class="compare-selector-row">';

        for (let i = 0; i < MAX_COMPARE; i++) {
            const selected = selectedPeptides[i] || '';
            html += `
                <div class="compare-selector">
                    <label>Peptide ${i + 1}</label>
                    <select class="compare-select" data-index="${i}">
                        <option value="">-- Select Peptide --</option>
                        ${peptides.map(p => `
                            <option value="${p.id}" ${selected === p.id ? 'selected' : ''}>
                                ${p.name}
                            </option>
                        `).join('')}
                    </select>
                    ${selected ? `<button class="compare-remove" data-index="${i}" title="Remove">✕</button>` : ''}
                </div>
            `;
        }

        html += '</div>';
        html += '<button class="compare-btn" id="compare-now-btn">Compare Selected</button>';

        container.innerHTML = html;

        // Add event listeners
        container.querySelectorAll('.compare-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const value = e.target.value;

                if (value) {
                    selectedPeptides[index] = value;
                } else {
                    selectedPeptides[index] = null;
                }

                // Remove nulls and update
                selectedPeptides = selectedPeptides.filter(p => p);
                renderSelectors();
            });
        });

        container.querySelectorAll('.compare-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                selectedPeptides.splice(index, 1);
                renderSelectors();
                renderComparison();
            });
        });

        document.getElementById('compare-now-btn')?.addEventListener('click', renderComparison);
    }

    // Render comparison table
    function renderComparison() {
        const container = document.querySelector('.compare-table-container');
        if (!container) return;

        const validPeptides = selectedPeptides.filter(p => p);

        if (validPeptides.length < 2) {
            container.innerHTML = `
                <div class="compare-empty">
                    <p>Select at least 2 peptides to compare</p>
                </div>
            `;
            return;
        }

        const peptideData = validPeptides.map(id => ({
            id,
            data: getPeptideData(id)
        })).filter(p => p.data);

        if (peptideData.length < 2) {
            container.innerHTML = `<div class="compare-empty"><p>Could not load peptide data</p></div>`;
            return;
        }

        // Build comparison table
        const rows = [
            { label: 'Full Name', key: 'fullName' },
            { label: 'Category', key: 'category' },
            { label: 'Strength Rating', key: 'strength', format: v => v ? `${(v * 100).toFixed(0)}%` : 'N/A' },
            { label: 'Vial Amount', key: 'vialAmount' },
            { label: 'Typical Dose', key: 'dose' },
            { label: 'Administration', key: 'administration' },
            { label: 'Protocol', key: 'protocol' },
            { label: 'Benefits', key: 'benefits', format: v => Array.isArray(v) ? `<ul>${v.slice(0, 5).map(b => `<li>${b}</li>`).join('')}</ul>` : v },
            { label: 'Side Effects', key: 'sideEffects', format: v => Array.isArray(v) ? `<ul>${v.map(s => `<li>${s}</li>`).join('')}</ul>` : v },
            { label: 'Available Forms', key: 'forms', format: v => Array.isArray(v) ? v.slice(0, 3).join(', ') : v }
        ];

        let html = `
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>Attribute</th>
                        ${peptideData.map(p => `<th>${p.data.shortcuts?.[0] || p.id}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            <td class="compare-label">${row.label}</td>
                            ${peptideData.map(p => {
            const value = p.data[row.key];
            const formatted = row.format ? row.format(value) : (value || 'N/A');
            return `<td>${formatted}</td>`;
        }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    // Add peptide to comparison (called from peptide modal)
    function addToCompare(peptideId) {
        if (selectedPeptides.length >= MAX_COMPARE) {
            alert(`Maximum ${MAX_COMPARE} peptides can be compared at once`);
            return false;
        }

        if (selectedPeptides.includes(peptideId)) {
            return false; // Already added
        }

        selectedPeptides.push(peptideId);
        renderSelectors();

        // Open panel if closed
        const panel = document.getElementById('compare-panel');
        const toggle = document.getElementById('compare-toggle');
        if (panel && panel.classList.contains('collapsed') && typeof window.togglePanel === 'function') {
            window.togglePanel(panel, toggle);
        }

        if (selectedPeptides.length >= 2) {
            renderComparison();
        }

        return true;
    }

    // Initialize
    function init() {
        if (isInitialized) return;

        // Wait for peptide database to load
        const checkDatabase = () => {
            if (typeof window.PEPTIDES_DATABASE !== 'undefined' &&
                Object.keys(window.PEPTIDES_DATABASE).length > 0) {
                createComparisonPanel();
                isInitialized = true;
                console.log('⚖️ Peptide Comparison Tool initialized');
            } else {
                setTimeout(checkDatabase, 500);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkDatabase);
        } else {
            checkDatabase();
        }
    }

    init();

    // Export for external use
    window.PeptideCompare = {
        add: addToCompare,
        toggle: () => {
            const p = document.getElementById('compare-panel');
            const t = document.getElementById('compare-toggle');
            if (p && t && typeof window.togglePanel === 'function') window.togglePanel(p, t);
        },
        getSelected: () => [...selectedPeptides],
        clear: () => {
            selectedPeptides = [];
            renderSelectors();
            renderComparison();
        }
    };
})();
