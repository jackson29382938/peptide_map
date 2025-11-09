// three.js (r128)
const THREE_JS = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// OrbitControls
const ORBIT_CONTROLS = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';

// OBJLoader
const OBJ_LOADER = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js';

// Load them in order
function loadScript(src, callback) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = callback;
    s.onerror = () => console.error('Failed to load', src);
    document.head.appendChild(s);
}

loadScript(THREE_JS, () => {
    loadScript(ORBIT_CONTROLS, () => {
        loadScript(OBJ_LOADER, () => {
            console.log('Three.js + helpers loaded');
        });
    });
});