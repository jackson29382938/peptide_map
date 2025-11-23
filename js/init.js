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
    
    // Ensure canvas is visible
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    
    container.appendChild(canvas);
    
    // Update global references after creation
    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    
    console.log('✅ Renderer created and canvas added to DOM');
    console.log('📐 Canvas size:', width, 'x', height);
    console.log('🎨 Canvas element:', canvas);
    console.log('🎨 Canvas computed style:', window.getComputedStyle(canvas).display, window.getComputedStyle(canvas).visibility);
    console.log('🎨 Container computed style:', window.getComputedStyle(container).display, window.getComputedStyle(container).zIndex);

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