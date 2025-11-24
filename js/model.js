// Track if we're currently loading to prevent concurrent loads
let isLoadingModel = false;
let modelLoadAttempts = 0;
const MAX_MODEL_LOAD_ATTEMPTS = 50; // Maximum retry attempts (10 seconds total)

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

    // Check if we've exceeded max attempts
    if (modelLoadAttempts >= MAX_MODEL_LOAD_ATTEMPTS) {
        console.error('❌ Max model load attempts reached, using placeholder');
        isLoadingModel = false;
        createPlaceholder();
        return;
    }

    // Wait for threeDepsReady if not yet ready
    if (!window.threeDepsReady && typeof THREE === 'undefined') {
        console.log('⏳ Waiting for Three.js dependencies to load...');
        isLoadingModel = false;
        // Listen for threeDepsReady event
        const handler = () => {
            window.removeEventListener('threeDepsReady', handler);
            setTimeout(loadModel, 100); // Small delay to ensure everything is attached
        };
        window.addEventListener('threeDepsReady', handler, { once: true });
        // Fallback timeout
        setTimeout(() => {
            window.removeEventListener('threeDepsReady', handler);
            if (!window.threeDepsReady) {
                console.warn('⚠️ threeDepsReady event not received, attempting to load anyway...');
                loadModel();
            }
        }, 2000);
        return;
    }

    isLoadingModel = true;
    modelLoadAttempts++;
    console.log(`🔄 Starting model load process (attempt ${modelLoadAttempts}/${MAX_MODEL_LOAD_ATTEMPTS})...`);
    
    // Check if THREE is available
    const THREE_REF = typeof THREE !== 'undefined' ? THREE : (typeof window.THREE !== 'undefined' ? window.THREE : null);
    
    if (!THREE_REF) {
        console.warn('⚠️ THREE is undefined, retrying in 200ms...');
        isLoadingModel = false;
        setTimeout(loadModel, 200);
        return;
    }
    
    // Check for OBJLoader in multiple ways
    let OBJLoaderClass = null;
    if (typeof THREE_REF.OBJLoader !== 'undefined') {
        OBJLoaderClass = THREE_REF.OBJLoader;
        console.log('✅ Found THREE.OBJLoader');
    } else if (typeof window.THREE !== 'undefined' && typeof window.THREE.OBJLoader !== 'undefined') {
        OBJLoaderClass = window.THREE.OBJLoader;
        console.log('✅ Found window.THREE.OBJLoader');
    } else {
        console.warn('⚠️ THREE.OBJLoader not yet loaded, retrying in 200ms...');
        console.warn('⚠️ THREE object keys:', Object.keys(THREE_REF).slice(0, 20));
        isLoadingModel = false;
        setTimeout(loadModel, 200);
        return;
    }
    
    const loader = new OBJLoaderClass();
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
        
        // Use defaultColor from regions.js if available, otherwise use fallback
        const color = (typeof defaultColor !== 'undefined') ? defaultColor : 
                      (typeof window.defaultColor !== 'undefined') ? window.defaultColor : 
                      0x808080; // Fallback gray color
        
        const geometry = new THREE.BoxGeometry(10, 10, 4);
        const material = new THREE.MeshStandardMaterial({
            color: color,
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

    const fullPath = window.location.origin + '/' + modelPath;
    console.log('🔄 Attempting to load model from:', modelPath);
    console.log('🔍 Full URL:', fullPath);
    console.log('🔍 OBJLoader class:', OBJLoaderClass);
    
    // First, verify the file is accessible
    fetch(modelPath, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                console.log('✅ Model file is accessible (HTTP', response.status + ')');
            } else {
                console.error('❌ Model file returned HTTP', response.status);
            }
        })
        .catch(err => {
            console.warn('⚠️ Could not verify model file accessibility:', err.message);
        });
    
    try {
        loader.load(
            modelPath,
            // Success callback
            object => {
                console.log('✅ OBJ file loaded successfully!');
                console.log('📦 Object:', object);
                console.log('📦 Object children:', object.children.length);
                
                // Remove any existing placeholder or old model before adding the new one
                removeExistingModels();
                
                modelContainer = object;
                interactiveObjects = []; // Reset array
                
                // Use defaultColor from regions.js if available, otherwise use fallback
                const color = (typeof defaultColor !== 'undefined') ? defaultColor : 
                              (typeof window.defaultColor !== 'undefined') ? window.defaultColor : 
                              0x808080; // Fallback gray color
                
                modelContainer.traverse(child => {
                    if (child.isMesh) {
                        // Ensure geometry is properly set up
                        if (child.geometry) {
                            child.geometry.computeBoundingBox();
                            child.geometry.computeVertexNormals();
                        }
                        
                        child.material = new THREE.MeshStandardMaterial({
                            color: color,
                            metalness: 0.8,
                            roughness: 0.8,
                            flatShading: false,
                            side: THREE.DoubleSide // Ensure both sides are visible
                        });
                        interactiveObjects.push(child);
                        
                        // Make sure mesh is visible
                        child.visible = true;
                        console.log(`  📦 Mesh: ${child.name || 'unnamed'}, vertices: ${child.geometry?.attributes?.position?.count || 0}`);
                    }
                });
                
                // Verify interactive objects were added
                console.log(`📊 Total interactive objects: ${interactiveObjects.length}`);
                if (interactiveObjects.length === 0) {
                    console.error('❌ WARNING: No interactive objects found in model!');
                }

                const box = new THREE.Box3().setFromObject(modelContainer);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Center the model at origin
                modelContainer.position.sub(center);
                
                // Calculate appropriate camera distance based on model size
                const maxDim = Math.max(size.x, size.y, size.z);
                const distance = maxDim * 2.5; // Distance to view the whole model
                
                // Position camera to view the model
                if (camera && controls) {
                    camera.position.set(0, size.y * 0.5, distance);
                    camera.lookAt(0, 0, 0);
                    
                    // Set OrbitControls target to center of model
                    controls.target.set(0, 0, 0);
                    controls.update();
                    
                    console.log(`📐 Model dimensions: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
                    console.log(`📐 Model center: (${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`);
                    console.log(`📐 Camera positioned at: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`);
                }

                scene.add(modelContainer);
                initState.modelLoaded = true;
                isLoadingModel = false; // Reset loading flag
                modelLoadAttempts = 0; // Reset attempts counter on success
                console.log(`✅ Model added to scene with ${interactiveObjects.length} interactive objects`);
                checkReadiness();
                if (initState.allReady) {
                    updateInfo('Model Ready', 'Click on any muscle region to see a highlight!');
                    // Fade out title card after model is ready
                    setTimeout(() => {
                        const titleCard = document.getElementById('title-card');
                        if (titleCard) {
                            titleCard.classList.add('fade-out');
                            console.log('✅ Title card faded out');
                        }
                    }, 2000); // Fade out after 2 seconds
                }
            },
        // Progress callback
        xhr => {
            if (xhr && xhr.total > 0) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log(`📊 Loading model: ${Math.round(percentComplete)}%`);
            } else {
                console.log('📊 Loading model... (size unknown)');
            }
        },
        // Error callback
        err => {
            console.error('❌ OBJ load error details:');
            console.error('Error object:', err);
            console.error('Error type:', typeof err);
            console.error('Error message:', err?.message || 'No message');
            console.error('Error stack:', err?.stack || 'No stack');
            console.error('Attempted path:', modelPath);
            console.error('Full URL would be:', window.location.origin + '/' + modelPath);
            isLoadingModel = false; // Reset loading flag
            createPlaceholder();
        }
    );
    } catch (error) {
        console.error('❌ Exception during loader.load():', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        isLoadingModel = false;
        createPlaceholder();
    }
}