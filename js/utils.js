function updateInfo(title, message, titleClass = 'text-white') {
    const titleEl = document.getElementById('info-title');
    const msgEl   = document.getElementById('info-message');

    titleEl.className = 'font-bold text-lg mb-1';
    if (titleClass) titleEl.classList.add(titleClass);
    titleEl.textContent = title;
    msgEl.textContent   = message;
}

let animateStarted = false;

function animate() {
    requestAnimationFrame(animate);
    
    // Use global references (set in init.js)
    const controls = window.controls;
    const renderer = window.renderer;
    const scene = window.scene;
    const camera = window.camera;
    
    // Only render if all components are ready
    if (controls && renderer && scene && camera) {
        if (!animateStarted) {
            console.log('✅ Animation loop started - rendering scene');
            animateStarted = true;
        }
        controls.update();
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    const container = document.getElementById('container');
    if (!container) return;
    
    // Get actual visible dimensions
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    // Use global references
    const camera = window.camera;
    const renderer = window.renderer;
    const scene = window.scene;
    
    if (camera && renderer && scene) {
        // Update camera aspect ratio
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        
        // Resize renderer to match container
        renderer.setSize(w, h);
        
        // Force a render after resize to ensure canvas updates
        renderer.render(scene, camera);
        
        console.log(`✅ Renderer resized to ${w}x${h}`);
    }
}

// Also listen for container visibility changes
function setupContainerVisibilityObserver() {
    const container = document.getElementById('container');
    if (!container) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Container became visible - resize renderer
                if (window.onWindowResize) {
                    window.onWindowResize();
                }
                console.log('✅ Container became visible - resized renderer');
            }
        });
    }, { threshold: 0 });
    
    observer.observe(container);
}

// Make onWindowResize globally accessible
window.onWindowResize = onWindowResize;

// Make setupContainerVisibilityObserver globally accessible
window.setupContainerVisibilityObserver = setupContainerVisibilityObserver;

function getLeftPanelsWidth() {
    let maxWidth = 0;
    const tabPanel = document.getElementById('tab-panel');
    const studiesPanel = document.getElementById('studies-panel');
    const companiesPanel = document.getElementById('companies-panel');
    const quizPanel = document.getElementById('quiz-panel');
    const calcPanel = document.getElementById('calc-panel');
    const contactPanel = document.getElementById('contact-panel');

    if (tabPanel && !tabPanel.classList.contains('collapsed')) {
        maxWidth = Math.max(maxWidth, tabPanel.offsetWidth);
    }

    if (studiesPanel && !studiesPanel.classList.contains('collapsed')) {
        maxWidth = Math.max(maxWidth, studiesPanel.offsetWidth);
    }

    if (companiesPanel && !companiesPanel.classList.contains('collapsed')) {
        maxWidth = Math.max(maxWidth, companiesPanel.offsetWidth);
    }

    if (quizPanel && !quizPanel.classList.contains('collapsed')) {
        maxWidth = Math.max(maxWidth, quizPanel.offsetWidth);
    }

    if (calcPanel && !calcPanel.classList.contains('collapsed')) {
        maxWidth = Math.max(maxWidth, calcPanel.offsetWidth);
    }

    if (contactPanel && !contactPanel.classList.contains('collapsed')) {
        maxWidth = Math.max(maxWidth, contactPanel.offsetWidth);
    }

    return maxWidth;
}

function getLeftControlBase() {
    return getLeftPanelsWidth() + 20;
}

window.getLeftPanelsWidth = getLeftPanelsWidth;
window.getLeftControlBase = getLeftControlBase;