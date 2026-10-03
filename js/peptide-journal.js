// Peptide Journal Module
// User experience log for tracking peptide protocols and outcomes

(function () {
    'use strict';

    const STORAGE_KEY = 'peptideJournal';
    let journalPanel = null;
    let entries = [];
    let isInitialized = false;

    // Load entries from localStorage
    function loadEntries() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const parsed = stored ? JSON.parse(stored) : [];
            entries = Array.isArray(parsed) ? parsed.filter(e => e && typeof e === 'object') : [];
        } catch (e) {
            console.error('Error loading journal entries:', e);
            entries = [];
        }
    }

    // Save entries to localStorage
    function saveEntries() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error('Error saving journal entries:', e);
        }
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Get all available peptides for dropdown
    function getAllPeptides() {
        if (typeof window.PEPTIDES_DATABASE !== 'undefined') {
            return Object.keys(window.PEPTIDES_DATABASE).map(id => ({
                id,
                name: window.PEPTIDES_DATABASE[id].shortcuts?.[0] ||
                    window.PEPTIDES_DATABASE[id].fullName || id
            }));
        }
        return [];
    }

    // Create the journal panel
    function createJournalPanel() {
        if (document.getElementById('journal-panel')) return;

        journalPanel = document.createElement('div');
        journalPanel.id = 'journal-panel';
        journalPanel.className = 'collapsed';
        journalPanel.innerHTML = `
            <div id="journal-drag-handle" title="Drag to adjust panel width"></div>
            <div class="studies-header">
                <h2 class="studies-title">📓 Peptide Journal</h2>
                <div class="studies-meta">
                    <span>Log your protocols, doses, and outcomes. Entries are stored only in this browser (never uploaded); clearing site data deletes them.</span>
                </div>
            </div>
            <div id="journal-container" class="studies-list">
                <div class="journal-form-container"></div>
                <div class="journal-entries-container"></div>
            </div>
        `;
        document.body.appendChild(journalPanel);

        // Get toggle button
        const toggleBtn = document.getElementById('journal-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel(journalPanel, toggleBtn);
            }
        });

        renderForm();
        renderEntries();
    }

    // Render the entry form
    function renderForm() {
        const container = document.querySelector('.journal-form-container');
        if (!container) return;

        const peptides = getAllPeptides();
        const today = new Date().toISOString().split('T')[0];

        container.innerHTML = `
            <form id="journal-entry-form" class="journal-form">
                <div class="journal-form-row">
                    <div class="journal-field">
                        <label for="journal-date">Date</label>
                        <input type="date" id="journal-date" value="${today}" required>
                    </div>
                    <div class="journal-field">
                        <label for="journal-peptide">Peptide</label>
                        <select id="journal-peptide" required>
                            <option value="">-- Select --</option>
                            ${peptides.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`).join('')}
                            <option value="other">Other (specify in notes)</option>
                        </select>
                    </div>
                </div>
                <div class="journal-form-row">
                    <div class="journal-field">
                        <label for="journal-dose">Dose</label>
                        <input type="text" id="journal-dose" placeholder="e.g., 250mcg" required>
                    </div>
                    <div class="journal-field">
                        <label for="journal-route">Route</label>
                        <select id="journal-route">
                            <option value="subq">Subcutaneous</option>
                            <option value="im">Intramuscular</option>
                            <option value="oral">Oral</option>
                            <option value="nasal">Nasal</option>
                            <option value="topical">Topical</option>
                        </select>
                    </div>
                </div>
                <div class="journal-form-row">
                    <div class="journal-field full-width">
                        <label for="journal-notes">Notes / Observations</label>
                        <textarea id="journal-notes" rows="3" placeholder="How did you feel? Any effects or side effects?"></textarea>
                    </div>
                </div>
                <div class="journal-form-row">
                    <div class="journal-field">
                        <label>Outcome Rating</label>
                        <div class="journal-rating" id="journal-rating">
                            ${[1, 2, 3, 4, 5].map(n => `
                                <button type="button" class="rating-star" data-rating="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="journal-form-actions">
                    <button type="submit" class="journal-submit-btn">Add Entry</button>
                    <button type="button" class="journal-export-btn" id="journal-export">Export CSV</button>
                </div>
            </form>
        `;

        // Form submission
        document.getElementById('journal-entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            addEntry();
        });

        // Rating stars
        container.querySelectorAll('.rating-star').forEach(star => {
            star.addEventListener('click', () => {
                updateRatingDisplay(parseInt(star.dataset.rating, 10));
            });
        });

        // Export button
        document.getElementById('journal-export').addEventListener('click', exportToCsv);
    }

    function updateRatingDisplay(rating) {
        document.querySelectorAll('.rating-star').forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            star.classList.toggle('active', starRating <= rating);
            star.setAttribute('aria-pressed', String(starRating <= rating));
        });
    }

    // Add a new entry
    function addEntry() {
        const date = document.getElementById('journal-date').value;
        const peptide = document.getElementById('journal-peptide').value;
        const dose = document.getElementById('journal-dose').value.trim();
        const route = document.getElementById('journal-route').value;
        const notes = document.getElementById('journal-notes').value.trim();
        const rating = document.querySelectorAll('.rating-star.active').length;

        if (!date || !peptide || !dose) {
            alert('Please fill in required fields');
            return;
        }

        const entry = {
            id: Date.now() + Math.random(),
            date,
            peptide,
            dose,
            route,
            notes,
            rating,
            createdAt: new Date().toISOString()
        };

        entries.unshift(entry); // Add to beginning
        saveEntries();
        renderEntries();

        // Reset form
        document.getElementById('journal-entry-form').reset();
        document.getElementById('journal-date').value = new Date().toISOString().split('T')[0];
        updateRatingDisplay(0);
    }

    // Delete an entry
    function deleteEntry(id) {
        if (!confirm('Delete this journal entry?')) return;
        entries = entries.filter(e => e.id !== id);
        saveEntries();
        renderEntries();
    }

    // Render entries list
    function renderEntries() {
        const container = document.querySelector('.journal-entries-container');
        if (!container) return;

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="journal-empty">
                    <p>No entries yet. Start logging your peptide experience!</p>
                </div>
            `;
            return;
        }

        const peptides = getAllPeptides();
        const getPeptideName = (id) => {
            const p = peptides.find(p => p.id === id);
            return p ? p.name : id;
        };

        container.innerHTML = `
            <div class="journal-list">
                <h3>Recent Entries (${entries.length})</h3>
                ${entries.slice(0, 50).map(entry => `
                    <div class="journal-entry" data-id="${escapeHtml(entry.id)}">
                        <div class="journal-entry-header">
                            <span class="journal-entry-date">${formatDate(entry.date)}</span>
                            <span class="journal-entry-peptide">${escapeHtml(getPeptideName(entry.peptide))}</span>
                            <button class="journal-entry-delete" data-id="${escapeHtml(entry.id)}" title="Delete" aria-label="Delete entry">✕</button>
                        </div>
                        <div class="journal-entry-details">
                            <span class="journal-entry-dose">${escapeHtml(entry.dose)}</span>
                            <span class="journal-entry-route">${escapeHtml(formatRoute(entry.route))}</span>
                            ${entry.rating >= 1 && entry.rating <= 5 ? `<span class="journal-entry-rating" aria-label="${entry.rating} out of 5">${'★'.repeat(entry.rating)}${'☆'.repeat(5 - entry.rating)}</span>` : ''}
                        </div>
                        ${entry.notes ? `<div class="journal-entry-notes">${escapeHtml(entry.notes)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        // Delete buttons
        container.querySelectorAll('.journal-entry-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteEntry(Number(btn.dataset.id));
            });
        });
    }

    function formatDate(dateStr) {
        // "YYYY-MM-DD" parses as UTC, which shows the previous day in US timezones - build a local date
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
        const date = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(dateStr);
        if (isNaN(date)) return escapeHtml(dateStr || '');
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatRoute(route) {
        const routes = {
            'subq': 'SubQ',
            'im': 'IM',
            'oral': 'Oral',
            'nasal': 'Nasal',
            'topical': 'Topical'
        };
        return routes[route] || route;
    }

    // Export to CSV
    function exportToCsv() {
        if (entries.length === 0) {
            alert('No entries to export');
            return;
        }

        // Quote every field, and neutralise spreadsheet formulas (=, +, -, @) so opening the
        // file in Excel/Sheets can't execute anything typed into a note.
        const cell = (value) => {
            let text = String(value == null ? '' : value);
            if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
            return `"${text.replace(/"/g, '""')}"`;
        };

        const headers = ['Date', 'Peptide', 'Dose', 'Route', 'Rating', 'Notes', 'Created'];
        const rows = entries.map(e => [
            e.date,
            e.peptide,
            e.dose,
            e.route,
            e.rating || '',
            e.notes || '',
            e.createdAt
        ].map(cell));

        const csv = '\ufeff' + [headers.map(cell).join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `peptide-journal-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        URL.revokeObjectURL(url);
    }

    // Initialize
    function init() {
        if (isInitialized) return;

        loadEntries();

        const checkReady = () => {
            if (typeof window.PEPTIDES_DATABASE !== 'undefined') {
                createJournalPanel();
                isInitialized = true;
                console.log('📓 Peptide Journal initialized');
            } else {
                setTimeout(checkReady, 500);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkReady);
        } else {
            checkReady();
        }
    }

    init();

    // Export for external use
    window.PeptideJournal = {
        toggle: () => {
            const p = document.getElementById('journal-panel');
            const t = document.getElementById('journal-toggle');
            if (p && t && typeof window.togglePanel === 'function') window.togglePanel(p, t);
        },
        addEntry: addEntry,
        getEntries: () => [...entries],
        exportCsv: exportToCsv,
        clearAll: () => {
            if (confirm('Delete ALL journal entries? This cannot be undone.')) {
                entries = [];
                saveEntries();
                renderEntries();
            }
        }
    };
})();
