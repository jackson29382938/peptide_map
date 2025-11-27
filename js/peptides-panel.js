(function() {
    'use strict';

    // Convert peptideFormulations object to array format
    function getPeptidesArray() {
        if (!window.PEPTIDES_DATABASE) {
            return [];
        }

        const peptideFormulations = window.PEPTIDES_DATABASE;
        return Object.keys(peptideFormulations).map(key => ({
            id: key,
            ...peptideFormulations[key]
        }));
    }

    // Create searchable index
    function createPeptidesIndex() {
        const peptides = getPeptidesArray();
        return peptides.map((peptide) => ({
            ...peptide,
            searchText: [
                peptide.fullName,
                peptide.id,
                ...(peptide.shortcuts || []),
                peptide.category,
                peptide.dose,
                peptide.administration,
                peptide.protocol,
                ...(peptide.benefits || []),
                ...(peptide.forms || [])
            ].filter(Boolean).join(' ').toLowerCase()
        }));
    }

    let peptidesIndex = [];
    let initialized = false;
    let listElement = null;
    let filterInput = null;
    let countElement = null;
    let activeFilter = '';

    function initializePeptidesPanel(options = {}) {
        peptidesIndex = createPeptidesIndex();

        if (initialized && options.deferRender !== false) {
            return;
        }

        listElement = document.getElementById('peptides-list');
        filterInput = document.getElementById('peptides-filter');
        countElement = document.getElementById('peptides-count');
        const clearButton = document.getElementById('peptides-clear-filter');

        if (!listElement || !filterInput || !countElement || !clearButton) {
            return;
        }

        if (!initialized) {
            filterInput.addEventListener('input', debounce((event) => {
                activeFilter = event.target.value.trim().toLowerCase();
                renderPeptides();
            }, 200));

            clearButton.addEventListener('click', () => {
                filterInput.value = '';
                activeFilter = '';
                renderPeptides();
                filterInput.focus();
            });

            initialized = true;
        }

        if (options.deferRender === false) {
            activeFilter = filterInput.value.trim().toLowerCase();
            renderPeptides();
        }
    }

    function renderPeptides() {
        if (!listElement || !countElement) return;

        const filter = activeFilter;
        const filtered = filter
            ? peptidesIndex.filter(peptide => peptide.searchText.includes(filter))
            : peptidesIndex;

        countElement.textContent = `${filtered.length} peptide${filtered.length === 1 ? '' : 's'}`;

        if (filtered.length === 0) {
            listElement.innerHTML = `<div class="study-empty">No peptides match "<strong>${escapeHtml(filter)}</strong>". Try another keyword.</div>`;
            return;
        }

        listElement.innerHTML = filtered.map(peptide => createPeptideCard(peptide, filter)).join('');

        listElement.querySelectorAll('.study-card').forEach(card => {
            card.addEventListener('click', (event) => {
                const peptideId = card.dataset.peptideId;
                if (peptideId) {
                    openPeptideModal(peptideId);
                }
            });
        });
    }

    function createPeptideCard(peptide, filter) {
        const highlightedName = highlightMatches(peptide.fullName, filter);
        const badge = peptide.category ? `<span class="study-badge">${escapeHtml(peptide.category)}</span>` : '';
        
        // Show first 3 benefits
        const benefitsList = peptide.benefits && peptide.benefits.length > 0
            ? `<ul class="peptide-benefits">
                ${peptide.benefits.slice(0, 3).map(benefit => 
                    `<li>${highlightMatches(benefit, filter)}</li>`
                ).join('')}
                ${peptide.benefits.length > 3 ? `<li class="more-benefits">+${peptide.benefits.length - 3} more benefits</li>` : ''}
               </ul>`
            : '';

        // Show dosing info
        const dosingInfo = peptide.dose 
            ? `<p class="peptide-dose"><strong>Dose:</strong> ${escapeHtml(peptide.dose)}</p>`
            : '';

        // Show administration
        const adminInfo = peptide.administration
            ? `<p class="peptide-admin"><strong>Administration:</strong> ${escapeHtml(peptide.administration)}</p>`
            : '';

        return `
            <article class="study-card peptide-card" data-peptide-id="${peptide.id}">
                <div class="study-card-header">
                    ${badge}
                    <h3>${highlightedName}</h3>
                    ${peptide.shortcuts && peptide.shortcuts.length > 0 ? `<p class="peptide-shortcuts">${peptide.shortcuts.map(s => escapeHtml(s)).join(', ')}</p>` : ''}
                </div>
                ${dosingInfo}
                ${adminInfo}
                ${benefitsList}
                <div class="study-footer">
                    <span class="study-source">Strength: ${peptide.strength ? (peptide.strength * 100).toFixed(0) + '%' : 'N/A'}</span>
                </div>
            </article>
        `;
    }

    function highlightMatches(text, filter) {
        if (!filter) {
            return escapeHtml(text);
        }
        const regex = new RegExp(`(${escapeRegExp(filter)})`, 'gi');
        return escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    function escapeHtml(value) {
        return value
            ? String(value).replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
            : '';
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function debounce(fn, wait) {
        let timeout;
        return function debounced(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    function openPeptideModal(peptideId) {
        const peptide = peptidesIndex.find(p => p.id === peptideId);
        if (!peptide) return;

        const modal = document.getElementById('peptide-modal');
        const modalBody = document.getElementById('peptide-modal-body');
        
        if (!modal || !modalBody) return;

        modalBody.innerHTML = generatePeptideModalHTML(peptide);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePeptideModal() {
        const modal = document.getElementById('peptide-modal');
        if (!modal) return;

        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function generatePeptideModalHTML(peptide) {
        return `
            <h1 class="peptide-modal-title">${escapeHtml(peptide.fullName)}</h1>
            ${peptide.shortcuts && peptide.shortcuts.length > 0 
                ? `<p class="peptide-modal-shortcuts">Also known as: ${peptide.shortcuts.map(s => escapeHtml(s)).join(', ')}</p>` 
                : ''}
            
            ${peptide.category ? `
            <div class="peptide-modal-section">
                <div class="peptide-modal-badges">
                    <span class="peptide-modal-badge">${escapeHtml(peptide.category)}</span>
                    ${peptide.strength ? `<span class="peptide-modal-badge">Strength: ${(peptide.strength * 100).toFixed(0)}%</span>` : ''}
                </div>
            </div>
            ` : ''}

            <div class="peptide-modal-section">
                <h3>📋 Dosing & Administration</h3>
                <div class="peptide-modal-grid">
                    ${peptide.vialAmount ? `
                    <div class="peptide-modal-field">
                        <div class="peptide-modal-field-label">Vial Amount</div>
                        <div class="peptide-modal-field-value">${escapeHtml(peptide.vialAmount)}</div>
                    </div>
                    ` : ''}
                    ${peptide.dose ? `
                    <div class="peptide-modal-field">
                        <div class="peptide-modal-field-label">Standard Dose</div>
                        <div class="peptide-modal-field-value">${escapeHtml(peptide.dose)}</div>
                    </div>
                    ` : ''}
                    ${peptide.administration ? `
                    <div class="peptide-modal-field">
                        <div class="peptide-modal-field-label">Administration</div>
                        <div class="peptide-modal-field-value">${escapeHtml(peptide.administration)}</div>
                    </div>
                    ` : ''}
                    ${peptide.reconstitution ? `
                    <div class="peptide-modal-field">
                        <div class="peptide-modal-field-label">Reconstitution</div>
                        <div class="peptide-modal-field-value">${escapeHtml(peptide.reconstitution)}</div>
                    </div>
                    ` : ''}
                </div>
            </div>

            ${peptide.protocol ? `
            <div class="peptide-modal-section">
                <h3>📅 Protocol</h3>
                <div class="peptide-modal-protocol">${escapeHtml(peptide.protocol)}</div>
            </div>
            ` : ''}

            ${peptide.benefits && peptide.benefits.length > 0 ? `
            <div class="peptide-modal-section">
                <h3>✨ Key Benefits</h3>
                <ul class="peptide-modal-list">
                    ${peptide.benefits.map(benefit => `<li>${escapeHtml(benefit)}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${peptide.sideEffects && peptide.sideEffects.length > 0 ? `
            <div class="peptide-modal-section">
                <h3>⚠️ Side Effects</h3>
                <ul class="peptide-modal-list">
                    ${peptide.sideEffects.map(effect => `<li>${escapeHtml(effect)}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${peptide.forms && peptide.forms.length > 0 ? `
            <div class="peptide-modal-section">
                <h3>💊 Available Forms</h3>
                <div class="peptide-modal-badges">
                    ${peptide.forms.map(form => `<span class="peptide-modal-badge">${escapeHtml(form)}</span>`).join('')}
                </div>
            </div>
            ` : ''}
        `;
    }

    function initializeModal() {
        const modal = document.getElementById('peptide-modal');
        const closeBtn = document.querySelector('.peptide-modal-close');

        if (closeBtn) {
            closeBtn.addEventListener('click', closePeptideModal);
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closePeptideModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('peptide-modal');
                if (modal && modal.classList.contains('active')) {
                    closePeptideModal();
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit to ensure PEPTIDES_DATABASE is loaded
        setTimeout(() => {
            initializePeptidesPanel({ deferRender: false });
            initializeModal();
        }, 100);
    });

    window.initializePeptidesPanel = initializePeptidesPanel;
})();
