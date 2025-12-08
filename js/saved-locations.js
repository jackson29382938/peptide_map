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
            } else {
                panel.classList.add('collapsed');
                toggle.classList.remove('panel-open');
                toggle.innerHTML = '📍';
            }
            if (window.updateRightFloatingControls) window.updateRightFloatingControls();
        });

        // Setup Save Button
        if (saveBtn) {
            saveBtn.addEventListener('click', saveCurrentSpot);
        }

        renderList();

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

    function loadLocations() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) savedLocations = JSON.parse(raw);
        } catch (e) {
            console.error('Failed to load saved locations', e);
        }
    }

    function saveLocations() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocations));
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
            id: Date.now().toString(),
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
        setTimeout(() => saveBtn.innerHTML = originalText, 1500);

        // Add persistent marker to scene (through interaction.js or direct scene access if possible)
        if (window.addPermanentMarker) {
            window.addPermanentMarker(newLoc.position, newLoc.name);
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
            <div class="saved-item" onclick="window.focusLocation('${loc.id}')">
                <div class="saved-item-content">
                    <div class="saved-name">${loc.name}</div>
                    <div class="saved-detail">${loc.portion} • ${new Date(loc.date).toLocaleDateString()}</div>
                </div>
                <button class="saved-delete" onclick="event.stopPropagation(); window.deleteSavedLocation('${loc.id}')" title="Delete">🗑️</button>
            </div>
        `).join('');
    }

    // Expose functions
    window.deleteSavedLocation = deleteLocation;

    window.focusLocation = function (id) {
        const loc = savedLocations.find(l => l.id === id);
        if (loc) {
            if (window.flyToPosition) {
                window.flyToPosition(loc.position);
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
