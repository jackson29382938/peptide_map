// Track if we're currently loading to prevent concurrent loads
let isLoadingModel = false;

function loadModel() {
    // Prevent concurrent loading attempts
    if (isLoadingModel) {
        console.log('⚠️ Model load already in progress, skipping duplicate request');
        return;
    }
    
    // Check if we have a placeholder (which should be replaced)
    const placeholder = scene.getObjectByName('Placeholder_Body');
    
    // Only skip if we have a real model (not placeholder) already loaded
    if (modelContainer && modelContainer.children && modelContainer.children.length > 0 && !placeholder) {
        console.log('✅ Real model already loaded, skipping');
        return;
    }

    if (placeholder) {
        console.log('⚠️ Placeholder detected, will attempt to load real model');
    }

    isLoadingModel = true;
    console.log('🔄 Starting model load process...');
    
    // Check if OBJLoader is available
    if (typeof THREE === 'undefined' || typeof THREE.OBJLoader === 'undefined') {
        console.warn('⚠️ THREE.OBJLoader not yet loaded, retrying in 100ms...');
        isLoadingModel = false;
        setTimeout(loadModel, 100);
        return;
    }
    
    const loader = new THREE.OBJLoader();
    const modelPath = 'assets/FinalBaseMesh.obj';
    console.log('📁 Model path:', modelPath);

    // Helper function to remove any existing placeholder or model
    function removeExistingModels() {
        // Remove placeholder if it exists
        const placeholder = scene.getObjectByName('Placeholder_Body');
        if (placeholder) {
            scene.remove(placeholder);
            console.log('🗑️ Removed existing placeholder');
        }
        
        // Remove old modelContainer if it exists
        if (modelContainer) {
            scene.remove(modelContainer);
            console.log('🗑️ Removed existing model');
        }
    }

    function createPlaceholder() {
        // Remove any existing models first
        removeExistingModels();
        
        const geometry = new THREE.BoxGeometry(10, 10, 4);
        const material = new THREE.MeshStandardMaterial({
            color: defaultColor,
            metalness: 0.1,
            roughness: 0.7,
            flatShading: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'Placeholder_Body';
        mesh.position.y = 5;
        scene.add(mesh);
        interactiveObjects = [mesh]; // Reset and add placeholder
        initState.modelLoaded = true;
        console.log('✅ Placeholder model loaded');
        checkReadiness();
        updateInfo('Placeholder Model Loaded',
            'Click the cube near muscle regions to highlight!');
    }

    loader.load(
        modelPath,
        // Success callback
        object => {
            console.log('✅ OBJ file loaded successfully!');
            console.log('📦 Object:', object);
            
            // Remove any existing placeholder or old model before adding the new one
            removeExistingModels();
            
            modelContainer = object;
            interactiveObjects = []; // Reset array
            modelContainer.traverse(child => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: defaultColor,
                        metalness: 0.8,
                        roughness: 0.8,
                        flatShading: false
                    });
                    interactiveObjects.push(child);
                }
            });

            const box = new THREE.Box3().setFromObject(modelContainer);
            const center = box.getCenter(new THREE.Vector3());
            modelContainer.position.sub(center);

            scene.add(modelContainer);
            initState.modelLoaded = true;
            isLoadingModel = false; // Reset loading flag
            console.log(`✅ Model added to scene with ${interactiveObjects.length} interactive objects`);
            checkReadiness();
            if (initState.allReady) {
                updateInfo('Model Ready', 'Click on any muscle region to see a highlight!');
            }
        },
        // Progress callback
        xhr => {
            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log(`📊 Loading model: ${Math.round(percentComplete)}%`);
        },
        // Error callback
        err => {
            console.error('❌ OBJ load error details:');
            console.error('Error object:', err);
            console.error('Error message:', err.message || 'No message');
            console.error('Attempted path:', modelPath);
            isLoadingModel = false; // Reset loading flag
            createPlaceholder();
        }
    );
}