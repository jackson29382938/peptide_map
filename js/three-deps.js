// three.js (r128) - using multiple CDN options for reliability
const THREE_JS_CDNS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://unpkg.com/three@0.128.0/build/three.min.js'
];

// OrbitControls - using jsdelivr with proper path
const ORBIT_CONTROLS = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';

// OBJLoader - using jsdelivr with proper path for r128
// Note: For r128, examples are in examples/js/loaders/
const OBJ_LOADER = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js';
// Alternative CDN paths as fallback
const OBJ_LOADER_ALTERNATIVES = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/OBJLoader.js',
    'https://unpkg.com/three@0.128.0/examples/js/loaders/OBJLoader.js'
];

// Track loading state
window.threeDepsReady = false;

// Load them in order
function loadScript(src, callback, errorCallback) {
    const s = document.createElement('script');
    s.src = src;
    s.async = false; // Load synchronously to ensure order
    s.onload = callback;
    s.onerror = (err) => {
        console.error('❌ Failed to load', src, err);
        if (errorCallback) errorCallback(err);
    };
    document.head.appendChild(s);
}

// Try loading THREE.js from multiple CDNs
function loadThreeJS(cdnIndex = 0) {
    if (cdnIndex >= THREE_JS_CDNS.length) {
        console.error('❌ All THREE.js CDN attempts failed');
        // Still dispatch event so app can try to continue
        window.dispatchEvent(new CustomEvent('threeDepsReady'));
        return;
    }
    
    const cdnUrl = THREE_JS_CDNS[cdnIndex];
    console.log(`🔄 Attempting to load THREE.js from CDN ${cdnIndex + 1}/${THREE_JS_CDNS.length}: ${cdnUrl}`);
    
    loadScript(cdnUrl, () => {
        // Wait a moment for THREE to attach
        setTimeout(() => {
            if (typeof THREE !== 'undefined') {
                console.log('✅ Three.js loaded from', cdnUrl);
                // Make sure THREE is globally available
                if (typeof window.THREE === 'undefined') {
                    window.THREE = THREE;
                }
                loadOrbitControls();
            } else if (typeof window.THREE !== 'undefined') {
                console.log('✅ Three.js found on window.THREE');
                loadOrbitControls();
            } else {
                console.warn(`⚠️ THREE not found after loading ${cdnUrl}, trying next CDN...`);
                loadThreeJS(cdnIndex + 1);
            }
        }, 100);
    }, () => {
        // Error loading this CDN, try next
        console.warn(`⚠️ Failed to load from ${cdnUrl}, trying next CDN...`);
        loadThreeJS(cdnIndex + 1);
    });
}

function loadOrbitControls() {
    loadScript(ORBIT_CONTROLS, () => {
        console.log('✅ OrbitControls script loaded');
        // Give it a moment to attach
        setTimeout(() => {
            loadOBJLoader();
        }, 50);
    }, () => {
        console.warn('⚠️ OrbitControls failed to load, continuing anyway...');
        // Continue even if OrbitControls fails
        setTimeout(() => {
            loadOBJLoader();
        }, 50);
    });
}

function loadOBJLoader(cdnIndex = 0) {
    // Try loading OBJLoader from multiple CDNs
    if (cdnIndex >= OBJ_LOADER_ALTERNATIVES.length + 1) {
        console.error('❌ All OBJLoader CDN attempts failed');
        // Still dispatch event - model.js will handle fallback
        window.threeDepsReady = true;
        window.dispatchEvent(new CustomEvent('threeDepsReady'));
        return;
    }
    
    const loaderUrl = cdnIndex === 0 ? OBJ_LOADER : OBJ_LOADER_ALTERNATIVES[cdnIndex - 1];
    console.log(`🔄 Attempting to load OBJLoader from CDN ${cdnIndex + 1}: ${loaderUrl}`);
    
    // Load OBJLoader with a script that ensures it attaches
    const objLoaderScript = document.createElement('script');
    objLoaderScript.src = loaderUrl;
    objLoaderScript.async = false;
    objLoaderScript.onload = () => {
        console.log('✅ OBJLoader script loaded from', loaderUrl);
        // Wait a bit for OBJLoader to attach to THREE
        setTimeout(() => {
            // Verify OBJLoader is available
            if (typeof THREE !== 'undefined' || typeof window.THREE !== 'undefined') {
                const THREE_REF = typeof THREE !== 'undefined' ? THREE : window.THREE;
                
                // Check multiple ways OBJLoader might be attached
                let objLoaderAvailable = false;
                
                if (typeof THREE_REF.OBJLoader !== 'undefined') {
                    objLoaderAvailable = true;
                    console.log('✅ THREE.OBJLoader found');
                } else if (typeof window.THREE !== 'undefined' && typeof window.THREE.OBJLoader !== 'undefined') {
                    objLoaderAvailable = true;
                    console.log('✅ window.THREE.OBJLoader found');
                } else {
                    console.warn('⚠️ OBJLoader not found automatically after loading from', loaderUrl);
                    console.warn('⚠️ THREE object keys:', Object.keys(THREE_REF).slice(0, 20));
                    
                    // Try next CDN
                    loadOBJLoader(cdnIndex + 1);
                    return;
                }
                
                if (objLoaderAvailable) {
                    window.threeDepsReady = true;
                    console.log('✅ All Three.js dependencies ready');
                    // Dispatch event to signal readiness
                    window.dispatchEvent(new CustomEvent('threeDepsReady'));
                }
            } else {
                console.error('❌ THREE is undefined after loading all scripts');
                // Try next CDN
                loadOBJLoader(cdnIndex + 1);
            }
        }, 300); // Increased timeout to give more time for attachment
    };
    objLoaderScript.onerror = (err) => {
        console.error(`❌ Failed to load OBJLoader from ${loaderUrl}, trying next CDN...`);
        // Try next CDN
        loadOBJLoader(cdnIndex + 1);
    };
    document.head.appendChild(objLoaderScript);
}

// Check if THREE.js is already loaded (e.g., from another script)
if (typeof THREE !== 'undefined' || typeof window.THREE !== 'undefined') {
    console.log('✅ THREE.js already loaded');
    if (typeof window.THREE === 'undefined' && typeof THREE !== 'undefined') {
        window.THREE = THREE;
    }
    // Check if OBJLoader is also available
    if (typeof THREE !== 'undefined' && typeof THREE.OBJLoader !== 'undefined') {
        window.threeDepsReady = true;
        console.log('✅ All Three.js dependencies already ready');
        window.dispatchEvent(new CustomEvent('threeDepsReady'));
    } else {
        // THREE is loaded but OBJLoader might not be, so load OrbitControls and OBJLoader
        loadOrbitControls();
    }
} else {
    // Start loading THREE.js
    loadThreeJS();
}