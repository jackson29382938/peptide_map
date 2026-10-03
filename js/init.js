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
    // Cap the pixel ratio: 3x phone screens would otherwise render 9x the pixels for little visible gain
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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

    // Render once so the canvas isn't blank while the model loads (animate() takes over after that)
    renderer.render(scene, camera);

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

    // Match the renderer to the real container size once layout has settled
    setTimeout(() => {
        if (window.onWindowResize) window.onWindowResize();
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

    // Logo and Disclaimer panel shift logic is handled by updateFloatingControls in index.html
    // The previous implementation here was incomplete and conflicted with the main logic.
    // We remove the MutationObserver here to allow the main controller to manage layout.
}