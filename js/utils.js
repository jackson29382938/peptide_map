function updateInfo(title, message, titleClass = 'text-white') {
    const titleEl = document.getElementById('info-title');
    const msgEl   = document.getElementById('info-message');

    titleEl.className = 'font-bold text-lg mb-1';
    if (titleClass) titleEl.classList.add(titleClass);
    titleEl.textContent = title;
    msgEl.textContent   = message;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('container');
    const w = container.clientWidth;
    const h = container.clientHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}