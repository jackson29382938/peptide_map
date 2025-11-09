function onMouseClick(event) {
    event.preventDefault();

    const container = document.getElementById('container');
    const rect = container.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (!intersects.length) {
        updateInfo('No Model Hit', 'Try clicking directly on the model.', 'text-yellow-400');
        return;
    }

    const point = intersects[0].point;
    let closestRegion = null;
    let closestDist = Infinity;

    for (const name in regions) {
        const box = regions[name];
        const expanded = box.clone();
        expanded.min.subScalar(regionTolerance);
        expanded.max.addScalar(regionTolerance);

        if (expanded.containsPoint(point)) {
            const center = new THREE.Vector3();
            box.getCenter(center);
            const dist = point.distanceTo(center);
            if (dist < closestDist) {
                closestDist = dist;
                closestRegion = name;
            }
        }
    }

    if (closestRegion) {
        addHighlightSphere(point, closestRegion);
    } else {
        updateInfo('Region Not Defined',
            `Clicked X:${point.x.toFixed(2)}, Y:${point.y.toFixed(2)}, Z:${point.z.toFixed(2)}`,
            'text-gray-400');
    }
}

function addHighlightSphere(position, regionName) {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: highlightColor,
        transparent: true,
        opacity: 0.8,
        depthTest: true,
        depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.name = `highlight-${regionName}-${Date.now()}`;
    scene.add(mesh);

    updateInfo('Region Highlighted!',
        `${regionName} at X:${position.x.toFixed(2)}, Y:${position.y.toFixed(2)}, Z:${position.z.toFixed(2)}`,
        'text-red-400');

    setTimeout(() => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    }, highlightDuration);
}