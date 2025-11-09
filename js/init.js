let scene, camera, renderer, controls;
let modelContainer;
let raycaster, mouse;
let interactiveObjects = [];
let currentHighlight = null;

function initScene() {
    const container = document.getElementById('container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1f2937);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x404040, 5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 0, -1);
    camera.add(dirLight);
    scene.add(camera);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    loadModel();               // defined in model.js
}