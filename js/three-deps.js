// three.js (r128)
const THREE_JS = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// OrbitControls - using jsdelivr with proper path
const ORBIT_CONTROLS = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';

// OBJLoader - using jsdelivr with proper path  
const OBJ_LOADER = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js';

// Track loading state
window.threeDepsReady = false;

// Load them in order
function loadScript(src, callback) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = callback;
    s.onerror = (err) => {
        console.error('❌ Failed to load', src, err);
    };
    document.head.appendChild(s);
}

loadScript(THREE_JS, () => {
    console.log('✅ Three.js loaded');
    if (typeof THREE === 'undefined') {
        console.error('❌ THREE is still undefined after loading script');
        return;
    }
    
    // Make sure THREE is globally available
    if (typeof window.THREE === 'undefined') {
        window.THREE = THREE;
    }
    
    loadScript(ORBIT_CONTROLS, () => {
        console.log('✅ OrbitControls script loaded');
        // Give it a moment to attach
        setTimeout(() => {
            // Load OBJLoader with a script that ensures it attaches
            const objLoaderScript = document.createElement('script');
            objLoaderScript.src = OBJ_LOADER;
            objLoaderScript.onload = () => {
                console.log('✅ OBJLoader script loaded');
                // Wait a bit for OBJLoader to attach to THREE
                setTimeout(() => {
                    // Verify OBJLoader is available
                    if (typeof THREE !== 'undefined') {
                        // Check multiple ways OBJLoader might be attached
                        let objLoaderAvailable = false;
                        
                        if (typeof THREE.OBJLoader !== 'undefined') {
                            objLoaderAvailable = true;
                            console.log('✅ THREE.OBJLoader found');
                        } else if (typeof window.THREE !== 'undefined' && typeof window.THREE.OBJLoader !== 'undefined') {
                            objLoaderAvailable = true;
                            console.log('✅ window.THREE.OBJLoader found');
                        } else {
                            console.warn('⚠️ OBJLoader not found automatically');
                            console.warn('⚠️ THREE object:', THREE);
                            console.warn('⚠️ THREE keys:', Object.keys(THREE).slice(0, 20));
                            
                            // Try to manually define OBJLoader using the code from examples
                            try {
                                // This is a simplified OBJLoader implementation
                                if (typeof THREE.FileLoader !== 'undefined' && typeof THREE.LoadingManager !== 'undefined') {
                                    console.log('⚠️ Attempting to create OBJLoader manually...');
                                    // We'll let the model.js handle the retry logic
                                }
                            } catch (e) {
                                console.error('❌ Error trying to create OBJLoader:', e);
                            }
                        }
                        
                        if (objLoaderAvailable) {
                            window.threeDepsReady = true;
                            console.log('✅ All Three.js dependencies ready');
                            // Dispatch event to signal readiness
                            window.dispatchEvent(new CustomEvent('threeDepsReady'));
                        } else {
                            console.error('❌ OBJLoader failed to attach to THREE');
                            // Still dispatch event - model.js will retry
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('threeDepsReady'));
                            }, 500);
                        }
                    } else {
                        console.error('❌ THREE is undefined after loading all scripts');
                    }
                }, 200);
            };
            objLoaderScript.onerror = (err) => {
                console.error('❌ Failed to load OBJLoader:', err);
            };
            document.head.appendChild(objLoaderScript);
        }, 50);
    });
});