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
    }
    
    // Show title card when side panel is hidden
    const titleCard = document.getElementById('title-card');
    if (titleCard) {
        titleCard.classList.remove('hidden');
    }
}

function onMouseClick(event) {
    event.preventDefault();

    // Readiness check - ensure all systems are initialized
    if (!initState.allReady) {
        console.warn('⚠️ Click ignored - systems not ready yet', {
            sceneReady: initState.sceneReady,
            modelLoaded: initState.modelLoaded,
            regionsReady: initState.regionsReady,
            interactiveObjectsCount: interactiveObjects.length,
            hasRegions: typeof regions !== 'undefined',
            hasRegionInjuries: typeof regionInjuries !== 'undefined'
        });
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
        // Validate region data exists
        if (typeof regions === 'undefined' || typeof regionInjuries === 'undefined') {
            console.error('❌ Region data not available');
            updateInfo('Error', 'Region data not loaded. Please refresh the page.');
            return;
        }

        addHighlightSphere(point, closestRegion);
        addInjectionPointSpheres(closestRegion);

        const parts = closestRegion.split(' - ');
        const muscle = parts[0];
        const portion = parts[1];
        const injuries = regionInjuries[closestRegion] || ['No injuries listed'];

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
        const procedure = regionProcedures[closestRegion];
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
    mesh.name = `highlight-${regionName}`;
    scene.add(mesh);

    currentHighlight = mesh;

    // Debug mode: log click position
    if (typeof injectionDebugMode !== 'undefined' && injectionDebugMode) {
        console.log(`📍 Clicked position for "${regionName}":`, {
            x: position.x.toFixed(2),
            y: position.y.toFixed(2),
            z: position.z.toFixed(2),
            vectorCode: `new THREE.Vector3(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`
        });
    }
}

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
function onMouseMove(event) {
    if (!initState.allReady || injectionPointSpheres.length === 0) {
        return;
    }

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