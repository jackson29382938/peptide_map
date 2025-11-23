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
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Use global references
    const camera = window.camera;
    const renderer = window.renderer;
    
    if (camera && renderer) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
}

function getLeftPanelsWidth() {
    let maxWidth = 0;
    const tabPanel = document.getElementById('tab-panel');
    const studiesPanel = document.getElementById('studies-panel');
    const companiesPanel = document.getElementById('companies-panel');
    const quizPanel = document.getElementById('quiz-panel');
    const calcPanel = document.getElementById('calc-panel');

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

    return maxWidth;
}

function getLeftControlBase() {
    return getLeftPanelsWidth() + 20;
}

window.getLeftPanelsWidth = getLeftPanelsWidth;
window.getLeftControlBase = getLeftControlBase;