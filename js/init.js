let scene, camera, renderer, controls;
let modelContainer;
let raycaster, mouse;
let interactiveObjects = [];
let currentHighlight = null;
let ambientLight, directionalLight; // Store light references for theme adjustments

// Initialization state tracking
let initState = {
    sceneReady: false,
    modelLoaded: false,
    regionsReady: false,
    allReady: false
};

// Check if all systems are ready
function checkReadiness() {
    const ready = initState.sceneReady && 
                  initState.modelLoaded && 
                  initState.regionsReady &&
                  typeof regions !== 'undefined' &&
                  typeof regionInjuries !== 'undefined' &&
                  interactiveObjects.length > 0;
    
    if (ready && !initState.allReady) {
        initState.allReady = true;
        console.log('✅ All systems ready - interactions enabled');
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
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    scene.background = new THREE.Color(initialTheme === 'light' ? 0xf9fafb : 0x1f2937);
    
    // Listen for theme changes and update scene background
    window.addEventListener('themeChanged', (e) => {
        const theme = e.detail.theme;
        scene.background = new THREE.Color(theme === 'light' ? 0xf9fafb : 0x1f2937);
    });

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 30);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Lights - store references for theme adjustments
    ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.add(ambientLight);
    
    directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 0, -1);
    camera.add(directionalLight);
    scene.add(camera);
    
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

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    initState.sceneReady = true;
    console.log('✅ Scene initialized');
    
    // Check if regions are already loaded (they should be, but just in case)
    if (typeof regions !== 'undefined' && typeof regionInjuries !== 'undefined') {
        initState.regionsReady = true;
        console.log('✅ Regions data ready');
    }
    
    loadModel();               // defined in model.js
    checkReadiness();
    
    // Fallback: If after 5 seconds things aren't ready, log a warning
    setTimeout(() => {
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
}