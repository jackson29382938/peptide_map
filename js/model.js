function loadModel() {
    const loader = new THREE.OBJLoader();
    const modelPath = 'assets/FinalBaseMesh.obj';

    function createPlaceholder() {
        const geometry = new THREE.BoxGeometry(10, 10, 4);
        const material = new THREE.MeshStandardMaterial({
            color: defaultColor,
            metalness: .5,
            roughness: .5
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'Placeholder_Body';
        mesh.position.y = 5;
        scene.add(mesh);
        interactiveObjects.push(mesh);
        updateInfo('Placeholder Model Loaded',
            'Click the cube near muscle regions to highlight!');
    }

    loader.load(
        modelPath,
        object => {
            modelContainer = object;
            modelContainer.traverse(child => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: defaultColor,
                        metalness: .5,
                        roughness: .5
                    });
                    interactiveObjects.push(child);
                }
            });

            const box = new THREE.Box3().setFromObject(modelContainer);
            const center = box.getCenter(new THREE.Vector3());
            modelContainer.position.sub(center);

            scene.add(modelContainer);
            updateInfo('FinalBaseMesh.obj Loaded', 'Click on any muscle region!');
        },
        undefined,
        err => {
            console.error('OBJ load error → placeholder', err);
            createPlaceholder();
        }
    );
}