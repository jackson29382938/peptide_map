// Drag-to-resize for the left-hand panels. Every panel has an element whose id ends in
// "-drag-handle" (some are created later by other modules), so a single delegated listener
// covers them all. Width is remembered per panel; double-click a handle to reset it.
(function () {
    'use strict';

    const STORAGE_PREFIX = 'panelWidth:';
    const MIN_WIDTH = 320;
    const KEY_STEP = 24;
    const DESKTOP_MIN = 769; // below this the panels are full-screen sheets (see the mobile CSS)

    const isDesktop = () => window.innerWidth >= DESKTOP_MIN;
    const maxWidth = () => Math.floor(window.innerWidth * 0.9);
    const clamp = (w) => Math.max(MIN_WIDTH, Math.min(maxWidth(), Math.round(w)));

    function read(panelId) {
        try {
            const v = parseInt(localStorage.getItem(STORAGE_PREFIX + panelId), 10);
            return Number.isFinite(v) ? v : null;
        } catch (e) { return null; }
    }
    function write(panelId, width) {
        try {
            if (width == null) localStorage.removeItem(STORAGE_PREFIX + panelId);
            else localStorage.setItem(STORAGE_PREFIX + panelId, String(width));
        } catch (e) { /* not persisted */ }
    }

    function applyWidth(panel, width) {
        if (width == null) {
            ['width', 'min-width', 'max-width'].forEach((p) => panel.style.removeProperty(p));
        } else {
            const w = clamp(width) + 'px';
            panel.style.setProperty('width', w);
            panel.style.setProperty('min-width', w);
            panel.style.setProperty('max-width', w);
        }
        if (typeof window.updateFloatingControls === 'function') window.updateFloatingControls();
        if (typeof window.onWindowResize === 'function') window.onWindowResize();
    }

    function prepare(handle) {
        if (handle.dataset.resizeReady) return;
        handle.dataset.resizeReady = 'true';
        handle.setAttribute('role', 'separator');
        handle.setAttribute('aria-orientation', 'vertical');
        handle.setAttribute('aria-label', 'Resize panel (drag, or use the left and right arrow keys)');
        handle.tabIndex = 0;
        handle.style.touchAction = 'none';
        const panel = handle.parentElement;
        const saved = panel && read(panel.id);
        if (saved && isDesktop()) applyWidth(panel, saved);
    }

    function init() {
        document.querySelectorAll('[id$="-drag-handle"]').forEach(prepare);
        // Handles created later (chat, compare, journal panels)
        new MutationObserver(() => document.querySelectorAll('[id$="-drag-handle"]:not([data-resize-ready])').forEach(prepare))
            .observe(document.body, { childList: true });

        let drag = null;

        document.addEventListener('pointerdown', (e) => {
            const handle = e.target.closest && e.target.closest('[id$="-drag-handle"]');
            if (!handle || !isDesktop()) return;
            const panel = handle.parentElement;
            drag = { handle, panel, pointerId: e.pointerId };
            handle.setPointerCapture(e.pointerId);
            document.body.style.userSelect = 'none';
            panel.style.transition = 'none'; // follow the pointer instead of easing behind it
            e.preventDefault();
        });

        document.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            // Panels are anchored to the left edge, so the pointer's x is the new width
            applyWidth(drag.panel, e.clientX - drag.panel.getBoundingClientRect().left);
        });

        const finish = (e) => {
            if (!drag || e.pointerId !== drag.pointerId) return;
            drag.panel.style.transition = '';
            document.body.style.userSelect = '';
            write(drag.panel.id, Math.round(drag.panel.getBoundingClientRect().width));
            drag = null;
        };
        document.addEventListener('pointerup', finish);
        document.addEventListener('pointercancel', finish);

        document.addEventListener('dblclick', (e) => {
            const handle = e.target.closest && e.target.closest('[id$="-drag-handle"]');
            if (!handle) return;
            applyWidth(handle.parentElement, null);
            write(handle.parentElement.id, null);
        });

        document.addEventListener('keydown', (e) => {
            const handle = e.target.closest && e.target.closest('[id$="-drag-handle"]');
            if (!handle || !isDesktop() || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
            const panel = handle.parentElement;
            const next = panel.getBoundingClientRect().width + (e.key === 'ArrowRight' ? KEY_STEP : -KEY_STEP);
            applyWidth(panel, next);
            write(panel.id, clamp(next));
            e.preventDefault();
            e.stopPropagation();
        }, true);

        // A saved width can exceed a smaller window later
        window.addEventListener('resize', () => {
            document.querySelectorAll('[id$="-drag-handle"]').forEach((h) => {
                const panel = h.parentElement;
                if (!isDesktop()) { applyWidth(panel, null); return; }
                const saved = read(panel.id);
                if (saved) applyWidth(panel, saved);
            });
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
