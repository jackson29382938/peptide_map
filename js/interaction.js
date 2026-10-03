// Track active injection point spheres
let injectionPointSpheres = [];

function removeCurrentHighlight() {
    if (currentHighlight) {
        scene.remove(currentHighlight);
        currentHighlight.geometry.dispose();
        currentHighlight.material.dispose();
        currentHighlight = null;
    }
}

function removeInjectionPointSpheres() {
    injectionPointSpheres.forEach(sphere => {
        scene.remove(sphere);
        sphere.geometry.dispose();
        sphere.material.dispose();
    });
    injectionPointSpheres = [];
}

function hideSidePanel() {
    const panel = document.getElementById('side-panel');
    if (panel) {
        panel.classList.remove('active');
        if (window.updateRightFloatingControls) window.updateRightFloatingControls();
    }

    // Show title card when side panel is hidden
    const titleCard = document.getElementById('title-card');
    if (titleCard) {
        titleCard.classList.remove('hidden');
    }
}

// Ignore "clicks" that are really the end of an orbit/pan drag
let pointerDownPos = null;
const DRAG_THRESHOLD_PX = 5;
(function trackPointerDown() {
    const c = document.getElementById('container');
    if (!c) return;
    c.addEventListener('pointerdown', (e) => {
        pointerDownPos = { x: e.clientX, y: e.clientY };
    });
})();

function onMouseClick(event) {
    event.preventDefault();

    if (pointerDownPos &&
        Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y) > DRAG_THRESHOLD_PX) {
        return;
    }

    // Readiness check - ensure all systems are initialized
    if (!initState.allReady) {
        console.warn('⚠️ Click ignored - systems not ready yet');
        // Call checkReadiness to get detailed breakdown of what's missing
        if (typeof checkReadiness === 'function') {
            checkReadiness();
        } else {
            // Fallback logging if checkReadiness isn't available
            console.warn('Readiness status:', {
                sceneReady: initState.sceneReady,
                modelLoaded: initState.modelLoaded,
                regionsReady: initState.regionsReady,
                interactiveObjectsCount: interactiveObjects.length,
                hasRegions: typeof regions !== 'undefined',
                hasRegionInjuries: typeof regionInjuries !== 'undefined'
            });
        }
        updateInfo('Loading...', 'Please wait for the model to finish loading.');
        return;
    }

    // Validate required globals
    if (!raycaster || !camera || !scene || !interactiveObjects || interactiveObjects.length === 0) {
        console.error('❌ Missing required globals for click handling', {
            hasRaycaster: !!raycaster,
            hasCamera: !!camera,
            hasScene: !!scene,
            interactiveObjectsCount: interactiveObjects.length
        });
        return;
    }

    const container = document.getElementById('container');
    if (!container) {
        console.error('❌ Container element not found');
        return;
    }

    const rect = container.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    removeCurrentHighlight();
    removeInjectionPointSpheres();
    hideSidePanel();
    const infoBox = document.getElementById('info-box');
    if (infoBox) {
        infoBox.style.display = 'block';
    }
    updateInfo('Model Ready', 'Click on any muscle region to see a highlight!');

    if (!intersects.length) {
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
        window.selectRegion(closestRegion, point);
    } else {
        const infoBox = document.getElementById('info-box');
        if (infoBox) {
            infoBox.style.display = 'block';
        }
        updateInfo('Region Not Defined',
            `Clicked X:${point.x.toFixed(2)}, Y:${point.y.toFixed(2)}, Z:${point.z.toFixed(2)}`,
            'text-gray-400');
    }
}

// Global function to select a region programmatically
window.selectRegion = function (regionName, position = null) {
    // Validate region data exists
    if (typeof regions === 'undefined' || typeof regionInjuries === 'undefined') {
        console.error('❌ Region data not available');
        updateInfo('Error', 'Region data not loaded. Please refresh the page.');
        return;
    }

    // Default position to center of region if not provided
    if (!position && regions[regionName]) {
        position = new THREE.Vector3();
        regions[regionName].getCenter(position);
    } else if (!position) {
        // Fallback if region box missing
        position = new THREE.Vector3(0, 0, 0);
    }

    addHighlightSphere(position, regionName);
    addInjectionPointSpheres(regionName);

    const parts = regionName.split(' - ');
    const muscle = parts[0];
    const portion = parts[1];
    const injuries = regionInjuries[regionName] || ['No injuries listed'];

    // Update side panel
    const panelTitle = document.getElementById('panel-title');
    if (panelTitle) {
        panelTitle.textContent = muscle;
    }
    const portionElement = document.getElementById('panel-portion');
    if (portionElement) {
        if (portion) {
            portionElement.textContent = `Portion: ${portion}`;
            portionElement.style.display = 'block';
        } else {
            portionElement.style.display = 'none';
        }
    }

    const injuriesList = document.getElementById('panel-injuries');
    if (injuriesList) {
        injuriesList.innerHTML = '';
        injuries.forEach(injury => {
            const li = document.createElement('li');
            li.textContent = injury;
            injuriesList.appendChild(li);
        });
    }

    // Update injection procedure data
    const procedure = regionProcedures[regionName];
    const procedureSection = document.getElementById('panel-procedure');
    if (procedureSection) {
        if (procedure) {
            procedureSection.style.display = 'block';
            const procTechnique = document.getElementById('proc-technique');
            const procPosition = document.getElementById('proc-position');
            const procLandmark = document.getElementById('proc-landmark');
            const procNeedle = document.getElementById('proc-needle');
            const procAngle = document.getElementById('proc-angle');
            const procVolume = document.getElementById('proc-volume');
            const procNotes = document.getElementById('proc-notes');

            if (procTechnique) procTechnique.textContent = procedure.technique || 'N/A';
            if (procPosition) procPosition.textContent = procedure.position || 'N/A';
            if (procLandmark) procLandmark.textContent = procedure.landmark || 'N/A';
            if (procNeedle) procNeedle.textContent = procedure.needle || 'N/A';
            if (procAngle) procAngle.textContent = procedure.angleDepth || 'N/A';
            if (procVolume) procVolume.textContent = procedure.volume || 'N/A';
            if (procNotes) procNotes.textContent = procedure.notes || 'N/A';
        } else {
            procedureSection.style.display = 'none';
        }
    }

    // Show side panel
    const panel = document.getElementById('side-panel');
    if (panel) {
        panel.classList.add('active');
        // Update UI stacking
        if (window.updateRightFloatingControls) window.updateRightFloatingControls();
    }

    // Hide title card when side panel is shown
    const titleCard = document.getElementById('title-card');
    if (titleCard) {
        titleCard.classList.add('hidden');
    }

    // Hide info-box after click completed
    const infoBox = document.getElementById('info-box');
    if (infoBox) {
        infoBox.style.display = 'none';
    }
};

function addHighlightSphere(position, regionName) {
    // Remove existing highlights first to avoid duplicates
    removeCurrentHighlight();
    removeInjectionPointSpheres();

    // Use highlightColor from regions.js if available, otherwise use fallback
    const color = (typeof highlightColor !== 'undefined') ? highlightColor :
        (typeof window.highlightColor !== 'undefined') ? window.highlightColor :
            0xef4444; // Fallback red color

    const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Smoother sphere
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        depthTest: true,
        depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.name = `highlight-${regionName}`;

    // Add pulse animation state
    mesh.userData = {
        pulsePhase: 0,
        baseScale: 1.0,
        active: true
    };

    scene.add(mesh);

    currentHighlight = mesh;

    // Dispatch selection event
    window.dispatchEvent(new CustomEvent('regionSelected', {
        detail: {
            region: regionName,
            position: position,
            // Extract portion if available
            portion: regionName.includes('-') ? regionName.split('-')[1].trim() : ''
        }
    }));
}

// Map of saved-location id -> marker mesh
const persistentMarkers = new Map();

window.addPermanentMarker = function (position, name, id) {
    if (!scene || !position) return;
    if (id && persistentMarkers.has(id)) return; // already shown

    const geometry = new THREE.ConeGeometry(0.3, 0.8, 16);
    geometry.translate(0, 0.4, 0);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const mesh = new THREE.Mesh(geometry, material);

    const pos = new THREE.Vector3(position.x, position.y, position.z);
    mesh.position.copy(pos);
    mesh.lookAt(pos.clone().add(new THREE.Vector3(0, 0, 1)));
    mesh.name = `saved-${name || id || 'marker'}`;

    scene.add(mesh);
    if (id) persistentMarkers.set(id, mesh);
};

window.removePermanentMarker = function (id) {
    const mesh = persistentMarkers.get(id);
    if (!mesh) return;
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    persistentMarkers.delete(id);
};

// Smoothly move the orbit target (and camera) to a point on the model
let flyAnimationId = null;
window.flyToPosition = function (position) {
    if (!controls || !camera || !position) return;

    const target = new THREE.Vector3(position.x, position.y, position.z);
    const startTarget = controls.target.clone();
    const startCam = camera.position.clone();
    // Keep the current viewing direction, but move in a little closer
    const offset = startCam.clone().sub(startTarget);
    offset.setLength(Math.max(8, offset.length() * 0.6));
    const endCam = target.clone().add(offset);

    const duration = 700;
    const t0 = performance.now();
    if (flyAnimationId) cancelAnimationFrame(flyAnimationId);

    function step(now) {
        const k = Math.min((now - t0) / duration, 1);
        const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        controls.target.lerpVectors(startTarget, target, eased);
        camera.position.lerpVectors(startCam, endCam, eased);
        flyAnimationId = k < 1 ? requestAnimationFrame(step) : null;
    }
    flyAnimationId = requestAnimationFrame(step);
};

// Global function to animate the highlight
window.updateHighlightAnimation = function () {
    if (!currentHighlight || !currentHighlight.userData.active) return;

    // Pulse speed
    const speed = 0.003;
    const time = Date.now();

    // Oscillate scale between 1.0 and 1.2
    const scale = 1.0 + Math.sin(time * speed) * 0.2;
    currentHighlight.scale.set(scale, scale, scale);

    // Oscillate opacity between 0.4 and 0.8
    const opacity = 0.6 + Math.sin(time * speed) * 0.2;
    if (currentHighlight.material) {
        currentHighlight.material.opacity = opacity;
    }
};

function addInjectionPointSpheres(regionName) {
    // Check if injection points are defined for this region
    if (typeof injectionPoints === 'undefined') {
        console.warn('⚠️ Injection points data not loaded');
        return;
    }

    const points = injectionPoints[regionName];
    if (!points || points.length === 0) {
        console.log(`ℹ️ No injection points defined for "${regionName}"`);
        return;
    }

    console.log(`💉 Adding ${points.length} injection points for "${regionName}"`);

    points.forEach((point, index) => {
        // Determine color based on type
        const color = point.type === 'injury_specific'
            ? INJECTION_COLORS.INJURY_SPECIFIC
            : INJECTION_COLORS.GENERAL;

        // Create sphere geometry with specified size
        const geometry = new THREE.SphereGeometry(point.size, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.75,
            depthTest: true,
            depthWrite: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(point.position);
        mesh.name = `injection-${regionName}-${index}`;

        // Store metadata on the mesh for potential UI interactions
        mesh.userData = {
            regionName: regionName,
            targetInjuries: point.targetInjuries,
            notes: point.notes,
            type: point.type
        };

        scene.add(mesh);
        injectionPointSpheres.push(mesh);

        // Debug mode: log injection point details
        if (typeof injectionDebugMode !== 'undefined' && injectionDebugMode) {
            console.log(`  ✓ Point ${index + 1}:`, {
                position: point.position,
                size: point.size,
                type: point.type,
                injuries: point.targetInjuries
            });
        }
    });

    console.log(`✅ ${injectionPointSpheres.length} injection point spheres displayed`);
}

// Tooltip functionality for injection points
let mouseMoveQueued = false;
function onMouseMove(event) {
    if (!initState.allReady || injectionPointSpheres.length === 0) {
        return;
    }
    // Raycasting on every mousemove is wasteful; handle at most once per frame
    if (mouseMoveQueued) return;
    mouseMoveQueued = true;
    requestAnimationFrame(() => {
        mouseMoveQueued = false;
        handleInjectionHover(event);
    });
}

function handleInjectionHover(event) {
    if (injectionPointSpheres.length === 0) return;

    const container = document.getElementById('container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(injectionPointSpheres, false);

    const tooltip = document.getElementById('injection-tooltip');
    if (!tooltip) return;

    if (intersects.length > 0) {
        const sphere = intersects[0].object;
        const data = sphere.userData;

        // Update tooltip content
        const tooltipTitle = tooltip.querySelector('.tooltip-title');
        const tooltipType = tooltip.querySelector('.tooltip-type');
        const tooltipInjuries = tooltip.querySelector('.tooltip-injuries');
        const tooltipNotes = tooltip.querySelector('.tooltip-notes');

        if (tooltipTitle) tooltipTitle.textContent = data.regionName;
        if (tooltipType) {
            tooltipType.textContent =
                data.type === 'injury_specific' ? '🎯 Injury-Specific Site' : '✅ General Injection Site';
        }
        if (tooltipInjuries && data.targetInjuries) {
            tooltipInjuries.textContent = 'Targets: ' + data.targetInjuries.join(', ');
        }
        if (tooltipNotes) tooltipNotes.textContent = data.notes || '';

        // Add images if available (from injection-images.js)
        let imagesHtml = '';
        if (typeof getInjectionImages === 'function' && data.targetInjuries.length > 0) {
            // Get images for the first target injury (or combine multiple)
            const injury = data.targetInjuries[0];
            const images = getInjectionImages(data.regionName, injury);

            if (images && images.length > 0) {
                const regionPath = data.regionName.toLowerCase().replace(/[\s-]+/g, '_');
                imagesHtml = '<div class="tooltip-images">';
                images.forEach((img, idx) => {
                    if (idx < 3) { // Show max 3 images in tooltip
                        imagesHtml += `<img src="images/injection_points/${regionPath}/${img}" 
                                           alt="${injury}" 
                                           class="tooltip-image"
                                           onclick="openImageLightbox('images/injection_points/${regionPath}/${img}', '${injury}')"
                                           loading="lazy">`;
                    }
                });
                if (images.length > 3) {
                    imagesHtml += `<span class="more-images">+${images.length - 3} more</span>`;
                }
                imagesHtml += '</div>';
            }
        }

        // Update or create images container
        let imagesContainer = tooltip.querySelector('.tooltip-images-container');
        if (!imagesContainer) {
            imagesContainer = document.createElement('div');
            imagesContainer.className = 'tooltip-images-container';
            tooltip.appendChild(imagesContainer);
        }
        imagesContainer.innerHTML = imagesHtml;

        // Position tooltip near cursor
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 15}px`;
        tooltip.classList.add('visible');
    } else {
        tooltip.classList.remove('visible');
    }
}