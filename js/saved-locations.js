// Saved Locations Logic
(function () {
    'use strict';

    const STORAGE_KEY = 'peptide_saved_locations';
    let savedLocations = [];
    let panel, toggle, list, saveBtn;
    let currentSelection = null; // Store currently selected region data

    function initSavedLocations() {
        panel = document.getElementById('saved-locations-panel');
        toggle = document.getElementById('saved-toggle');
        list = document.getElementById('saved-list');
        saveBtn = document.getElementById('save-current-spot-btn');

        if (!panel || !toggle) return;

        // Load from storage
        loadLocations();

        // Setup Toggle
        toggle.addEventListener('click', () => {
            const isCollapsed = panel.classList.contains('collapsed');
            if (isCollapsed) {
                panel.classList.remove('collapsed');
                toggle.classList.add('panel-open');
                toggle.innerHTML = '✕';
                toggle.setAttribute('aria-expanded', 'true');
            } else {
                panel.classList.add('collapsed');
                toggle.classList.remove('panel-open');
                toggle.innerHTML = '📍';
                toggle.setAttribute('aria-expanded', 'false');
            }
            if (window.updateRightFloatingControls) window.updateRightFloatingControls();
        });

        // Setup Save Button
        if (saveBtn) {
            saveBtn.addEventListener('click', saveCurrentSpot);
        }

        bindListEvents();
        renderList();

        if (window.threeDepsReady && window.scene) {
            restoreMarkers();
        } else {
            window.addEventListener('appReady', restoreMarkers, { once: true });
        }

        // Listen for selection events from interactions.js
        window.addEventListener('regionSelected', (e) => {
            currentSelection = e.detail;
            updateSaveButtonState();
        });

        window.addEventListener('regionDeselected', () => {
            currentSelection = null;
            updateSaveButtonState();
        });
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function loadLocations() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            // Drop anything malformed (hand-edited or from an older version)
            savedLocations = Array.isArray(parsed)
                ? parsed.filter(l => l && typeof l.id === 'string' && typeof l.name === 'string' &&
                    l.position && Number.isFinite(l.position.x) && Number.isFinite(l.position.y) && Number.isFinite(l.position.z))
                : [];
        } catch (e) {
            console.error('Failed to load saved locations', e);
            savedLocations = [];
        }
    }

    function saveLocations() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocations));
        } catch (e) {
            console.warn('Could not persist saved locations (storage unavailable or full)', e);
        }
    }

    // Markers live in the 3D scene, which is created after this module initialises
    function restoreMarkers() {
        if (!window.addPermanentMarker) return;
        savedLocations.forEach(loc => window.addPermanentMarker(loc.position, loc.name, loc.id));
    }

    function updateSaveButtonState() {
        if (!saveBtn) return;
        if (currentSelection) {
            saveBtn.disabled = false;
            saveBtn.title = `Save location: ${currentSelection.region}`;
        } else {
            saveBtn.disabled = true;
            saveBtn.title = "Select a region on the 3D model first";
        }
    }

    function saveCurrentSpot() {
        if (!currentSelection) return;

        const newLoc = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: currentSelection.region,
            portion: currentSelection.portion || 'General',
            position: currentSelection.position || { x: 0, y: 0, z: 0 },
            date: new Date().toISOString()
        };

        savedLocations.unshift(newLoc); // Add to top
        saveLocations();
        renderList();

        // Visual feedback
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '✅ Saved!';
        setTimeout(() => { saveBtn.innerHTML = originalText; }, 1500);

        // Add persistent marker to scene (through interaction.js or direct scene access if possible)
        if (window.addPermanentMarker) {
            window.addPermanentMarker(newLoc.position, newLoc.name, newLoc.id);
        }
    }

    function deleteLocation(id) {
        savedLocations = savedLocations.filter(l => l.id !== id);
        saveLocations();
        renderList();

        // Remove marker from scene if possible
        if (window.removePermanentMarker) {
            window.removePermanentMarker(id);
        }
    }

    function renderList() {
        if (!list) return;
        if (savedLocations.length === 0) {
            list.innerHTML = '<div class="no-results" style="padding:16px; text-align:center; color:var(--text-tertiary);">No locations saved yet.<br>Click a muscle on the model to select it, then click "Save Selected Spot".</div>';
            return;
        }

        list.innerHTML = savedLocations.map(loc => `
            <div class="saved-item" role="button" tabindex="0" data-id="${escapeHtml(loc.id)}">
                <div class="saved-item-content">
                    <div class="saved-name">${escapeHtml(loc.name)}</div>
                    <div class="saved-detail">${escapeHtml(loc.portion)} • ${new Date(loc.date).toLocaleDateString()}</div>
                </div>
                <button class="saved-delete" data-delete-id="${escapeHtml(loc.id)}" title="Delete" aria-label="Delete saved location ${escapeHtml(loc.name)}">🗑️</button>
            </div>
        `).join('');
    }

    // One delegated handler instead of inline onclick attributes
    function bindListEvents() {
        if (!list) return;
        list.addEventListener('click', (e) => {
            const del = e.target.closest('[data-delete-id]');
            if (del) {
                e.stopPropagation();
                deleteLocation(del.dataset.deleteId);
                return;
            }
            const item = e.target.closest('.saved-item');
            if (item) window.focusLocation(item.dataset.id);
        });
        list.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('saved-item')) {
                e.preventDefault();
                window.focusLocation(e.target.dataset.id);
            }
        });
    }

    // Expose functions
    window.deleteSavedLocation = deleteLocation;

    window.focusLocation = function (id) {
        const loc = savedLocations.find(l => l.id === id);
        if (loc) {
            if (window.flyToPosition) {
                window.flyToPosition(loc.position, { distance: 14 });
            }
            if (window.selectRegion) {
                window.selectRegion(loc.name, loc.position);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSavedLocations);
    } else {
        initSavedLocations();
    }

})();
