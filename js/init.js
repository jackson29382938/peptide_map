// Global variables for Three.js scene (needed by animate() in utils.js)
let scene, camera, renderer, controls;
let modelContainer;
let raycaster, mouse;
let interactiveObjects = [];
let currentHighlight = null;
let ambientLight, directionalLight; // Store light references for theme adjustments

// Make them globally accessible for animate() function
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.controls = controls;

// Initialization state tracking
let initState = {
    sceneReady: false,
    modelLoaded: false,
    regionsReady: false,
    allReady: false
};

// Check if all systems are ready
function checkReadiness() {
    // Check each condition individually
    const checks = {
        sceneReady: initState.sceneReady,
        modelLoaded: initState.modelLoaded,
        regionsReady: initState.regionsReady,
        hasRegions: typeof regions !== 'undefined',
        hasRegionInjuries: typeof regionInjuries !== 'undefined',
        hasInteractiveObjects: interactiveObjects.length > 0
    };
    
    const ready = checks.sceneReady && 
                  checks.modelLoaded && 
                  checks.regionsReady &&
                  checks.hasRegions &&
                  checks.hasRegionInjuries &&
                  checks.hasInteractiveObjects;
    
    // Log detailed status for debugging - show which conditions are failing
    if (!ready) {
        const missing = Object.entries(checks)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        console.log('🔍 Readiness check - NOT READY:', {
            ...checks,
            interactiveObjectsCount: interactiveObjects.length,
            missingConditions: missing.length > 0 ? missing : 'none (should be ready!)'
        });
        
        // Log specific missing conditions
        if (missing.length > 0) {
            console.warn('❌ Missing conditions:', missing.join(', '));
        }
    }
    
    if (ready && !initState.allReady) {
        initState.allReady = true;
        console.log('✅ All systems ready - interactions enabled', checks);
        updateInfo('Model Ready', 'Click on any muscle region to see a highlight!');
        // Dispatch custom event to signal readiness
        window.dispatchEvent(new CustomEvent('appReady'));
    }
    
    return ready;
}

function initScene() {
    const container = document.getElementById('container');
    if (!container) {
        console.error('❌ Container element not found');
        return;
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    // Set initial background color based on theme
    // Match the body background color so they blend seamlessly
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const bgColor = initialTheme === 'light' ? 0xf9fafb : 0x1f2937;
    scene.background = new THREE.Color(bgColor);
    
    // Body background is transparent - canvas shows through
    document.body.style.backgroundColor = 'transparent';
    
    // Listen for theme changes and update scene background
    window.addEventListener('themeChanged', (e) => {
        const theme = e.detail.theme;
        const bgColor = theme === 'light' ? 0xf9fafb : 0x1f2937;
        scene.background = new THREE.Color(bgColor);
        // Body background stays transparent
        document.body.style.backgroundColor = 'transparent';
    });

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 30);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    
    // Ensure canvas is visible with explicit styles (no !important)
    const canvas = renderer.domElement;
    canvas.style.cssText = `
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 0;
        background: transparent;
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
    `;
    
    // Also set container styles explicitly - proper layout element (no !important)
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 0;
        background: transparent;
        pointer-events: auto;
        display: block;
    `;
    
    container.appendChild(canvas);
    
    // Verify canvas is actually in the DOM
    if (!container.contains(canvas)) {
        console.error('❌ Canvas was not added to container! Re-adding...');
        container.appendChild(canvas);
    }
    
    // Update global references after creation
    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    
    // Store canvas reference globally for debugging
    window.canvas = canvas;
    window.container = container;
    
    // FORCE REFLOW IMMEDIATELY - This is the key fix!
    // Read layout properties to trigger browser reflow/paint
    void canvas.offsetHeight;
    void canvas.offsetWidth;
    void canvas.clientHeight;
    void canvas.clientWidth;
    void container.offsetHeight;
    void container.offsetWidth;
    void container.clientHeight;
    void container.clientWidth;
    
    // Force immediate render
    renderer.render(scene, camera);
    
    // CRITICAL: Wait for updateFloatingControls to be defined, then call it
    // This is what makes the canvas visible when calculator panel opens
    const waitForFloatingControls = setInterval(() => {
        if (typeof window.updateFloatingControls === 'function') {
            clearInterval(waitForFloatingControls);
            // Call it immediately - this reads offsetWidth from panels, triggering reflow
            window.updateFloatingControls();
            // Force render after reflow
            renderer.render(scene, camera);
            console.log('✅ Called updateFloatingControls immediately after it was defined');
            
            // Also force another render in the next frame
            requestAnimationFrame(() => {
                renderer.render(scene, camera);
            });
        }
    }, 10); // Check every 10ms
    
    // Also listen for when startApplication completes (updateFloatingControls is defined there)
    window.addEventListener('appReady', () => {
        if (typeof window.updateFloatingControls === 'function') {
            window.updateFloatingControls();
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
            console.log('✅ Called updateFloatingControls on appReady event');
        }
    }, { once: true });
    
    // Also trigger another reflow after a microtask
    Promise.resolve().then(() => {
        void canvas.offsetHeight;
        renderer.render(scene, camera);
    });
    
    console.log('✅ Canvas added and reflow forced immediately');
    
    // Verify canvas is in DOM and visible
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(canvas);
        const containerStyle = window.getComputedStyle(container);
        console.log('✅ Renderer created and canvas added to DOM');
        console.log('📐 Canvas size:', width, 'x', height);
        console.log('🎨 Canvas element:', canvas);
        console.log('🎨 Canvas styles:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            zIndex: computedStyle.zIndex,
            position: computedStyle.position,
            width: computedStyle.width,
            height: computedStyle.height
        });
        console.log('🎨 Container styles:', {
            display: containerStyle.display,
            visibility: containerStyle.visibility,
            zIndex: containerStyle.zIndex,
            position: containerStyle.position,
            width: containerStyle.width,
            height: containerStyle.height
        });
        
        // Force a render to ensure canvas is visible
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }, 100);

    // Lights - store references for theme adjustments
    ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.add(ambientLight);
    
    // Directional light positioned in world space (not attached to camera)
    directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(10, 10, 10); // Position in world space
    scene.add(directionalLight);
    
    // Add a second directional light from the opposite side for better illumination
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight2.position.set(-10, 5, -10);
    scene.add(directionalLight2);
    
    // Function to update lighting based on theme
    function updateLightingForTheme(theme) {
        if (theme === 'light') {
            // Reduce light intensity in light mode
            ambientLight.intensity = 4; // Reduced from 5
            directionalLight.intensity = 3; // Reduced from 3
        } else {
            // Normal intensity for dark mode
            ambientLight.intensity = 1.5;
            directionalLight.intensity = 3;
        }
    }
    
    // Set initial lighting (reuse initialTheme from above)
    updateLightingForTheme(initialTheme);
    
    // Listen for theme changes
    window.addEventListener('themeChanged', (e) => {
        updateLightingForTheme(e.detail.theme);
    });

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    
    // Update global reference after controls creation
    window.controls = controls;

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    initState.sceneReady = true;
    console.log('✅ Scene initialized');
    
    // Setup visibility observer to resize when container becomes visible
    if (typeof window.setupContainerVisibilityObserver === 'function') {
        window.setupContainerVisibilityObserver();
    }
    
    // FORCE REFLOW AND RENDER IMMEDIATELY - Multiple times to ensure it works
    if (renderer && scene && camera && canvas) {
        // Get actual container dimensions
        const actualWidth = container.clientWidth || window.innerWidth;
        const actualHeight = container.clientHeight || window.innerHeight;
        
        // Resize renderer to match container
        renderer.setSize(actualWidth, actualHeight);
        camera.aspect = actualWidth / actualHeight;
        camera.updateProjectionMatrix();
        
        // Force reflow by reading layout properties
        void canvas.offsetHeight;
        void container.offsetHeight;
        
        // Force render
        renderer.render(scene, camera);
        console.log(`✅ Initial render forced - size: ${actualWidth}x${actualHeight}`);
        
        // Force another reflow and render after a tiny delay
        requestAnimationFrame(() => {
            void canvas.offsetHeight;
            void container.offsetHeight;
            renderer.render(scene, camera);
            console.log('✅ Second render in requestAnimationFrame');
        });
    }
    
    // Force a resize to ensure canvas is properly sized
    setTimeout(() => {
        if (window.onWindowResize) {
            window.onWindowResize();
            console.log('✅ Initial resize forced');
        }
        // Force another reflow after resize
        if (canvas && container) {
            void canvas.offsetHeight;
            void container.offsetHeight;
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        }
    }, 100);
    
    // Check if regions are already loaded (they should be, but just in case)
    if (typeof regions !== 'undefined' && typeof regionInjuries !== 'undefined') {
        initState.regionsReady = true;
        console.log('✅ Regions data ready');
        checkReadiness(); // Check immediately if regions are ready
    }
    
    // Also listen for regions ready event
    window.addEventListener('regionsReady', () => {
        initState.regionsReady = true;
        checkReadiness();
    }, { once: true });
    
    loadModel();               // defined in model.js
    
    // Check readiness after a delay to allow everything to load
    setTimeout(() => {
        checkReadiness();
    }, 200);
    
    // Periodic readiness check - check every 500ms until ready
    const readinessInterval = setInterval(() => {
        if (initState.allReady) {
            clearInterval(readinessInterval);
            return;
        }
        checkReadiness();
    }, 500);
    
    // Fallback: If after 5 seconds things aren't ready, log a warning
    setTimeout(() => {
        clearInterval(readinessInterval);
        if (!initState.allReady) {
            console.warn('⚠️ Application not fully ready after 5 seconds', {
                sceneReady: initState.sceneReady,
                modelLoaded: initState.modelLoaded,
                regionsReady: initState.regionsReady,
                interactiveObjectsCount: interactiveObjects.length,
                hasRegions: typeof regions !== 'undefined',
                hasRegionInjuries: typeof regionInjuries !== 'undefined'
            });
            // Try to check readiness one more time
            checkReadiness();
        }
    }, 5000);
    
    // AGGRESSIVE REFLOW FORCING - Multiple attempts at different times
    // This simulates what happens when calculator panel opens
    
    // Immediate reflow (right after scene init)
    requestAnimationFrame(() => {
        if (canvas && container && renderer && scene && camera) {
            void canvas.offsetHeight;
            void container.offsetHeight;
            renderer.render(scene, camera);
            console.log('✅ Reflow #1 in requestAnimationFrame');
        }
    });
    
    // Reflow after a short delay
    setTimeout(() => {
        if (canvas && container && renderer && scene && camera) {
            // Force reflow by reading layout properties (exactly what updateFloatingControls does)
            void canvas.offsetHeight;
            void canvas.offsetWidth;
            void container.offsetHeight;
            void container.offsetWidth;
            
            // Trigger resize event
            window.dispatchEvent(new Event('resize'));
            
            // Force render
            renderer.render(scene, camera);
            console.log('✅ Reflow #2 after 100ms');
        }
    }, 100);
    
    // Reflow after medium delay (when updateFloatingControls would run)
    setTimeout(() => {
        if (canvas && container && renderer && scene && camera) {
            // Call updateFloatingControls if available (this reads offsetWidth, triggering reflow)
            if (typeof window.updateFloatingControls === 'function') {
                window.updateFloatingControls();
            }
            
            // Force more reflows
            void canvas.offsetHeight;
            void container.offsetHeight;
            
            // Force render
            renderer.render(scene, camera);
            console.log('✅ Reflow #3 after 300ms (with updateFloatingControls)');
        }
    }, 300);
    
    // Final reflow after longer delay
    setTimeout(() => {
        if (canvas && container && renderer && scene && camera) {
            // Read all layout properties to force reflow
            const canvasHeight = canvas.offsetHeight;
            const canvasWidth = canvas.offsetWidth;
            const containerHeight = container.offsetHeight;
            const containerWidth = container.offsetWidth;
            
            // Trigger resize
            window.dispatchEvent(new Event('resize'));
            
            // Force multiple renders
            for (let i = 0; i < 3; i++) {
                renderer.render(scene, camera);
            }
            
            console.log('✅ Reflow #4 after 500ms - Final attempt', {
                canvasSize: `${canvasWidth}x${canvasHeight}`,
                containerSize: `${containerWidth}x${containerHeight}`
            });
        }
    }, 500);
    
    // Also wrap updateFloatingControls to force render after it runs
    const originalUpdateFloatingControls = window.updateFloatingControls;
    if (typeof originalUpdateFloatingControls === 'function') {
        window.updateFloatingControls = function() {
            const result = originalUpdateFloatingControls.apply(this, arguments);
            // After floating controls update, force canvas render
            setTimeout(() => {
                if (window.renderer && window.scene && window.camera) {
                    window.renderer.render(window.scene, window.camera);
                }
            }, 0);
            return result;
        };
    }
}