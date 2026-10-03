// three.js r128 + OrbitControls + OBJLoader are self-hosted in js/vendor/ and loaded with plain
// <script> tags in index.html (no CDN round trips, no version drift). This shim just confirms
// everything attached and signals readiness to the rest of the app.
(function () {
    'use strict';

    const ok = typeof window.THREE !== 'undefined' &&
        typeof THREE.OrbitControls !== 'undefined' &&
        typeof THREE.OBJLoader !== 'undefined';

    if (!ok) {
        console.error('❌ Three.js dependencies are missing - check js/vendor/ files loaded correctly');
    }

    // Always signal readiness so the app can fall back gracefully instead of hanging
    window.threeDepsReady = true;
    window.dispatchEvent(new CustomEvent('threeDepsReady'));
})();
