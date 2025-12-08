// Loading States Module
// Provides loading spinners and skeleton screens for better UX

(function () {
    'use strict';

    let loadingOverlay = null;
    let progressBar = null;
    let progressValue = 0;
    let progressInterval = null;

    // Create loading overlay for 3D model
    function createLoadingOverlay() {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading 3D Model...</div>
            <div class="loading-progress">
                <div class="loading-progress-bar" id="loading-progress-bar"></div>
            </div>
        `;

        // Insert as first child of body so it covers everything
        document.body.insertBefore(loadingOverlay, document.body.firstChild);

        progressBar = loadingOverlay.querySelector('#loading-progress-bar');

        // Start simulated progress
        startProgressSimulation();
    }

    function startProgressSimulation() {
        progressValue = 0;
        progressInterval = setInterval(() => {
            // Slow down as we approach 90%
            const increment = progressValue < 60 ? 3 : progressValue < 80 ? 1 : 0.5;
            progressValue = Math.min(progressValue + increment, 90);
            updateProgress(progressValue);
        }, 100);
    }

    function updateProgress(value) {
        if (progressBar) {
            progressBar.style.width = `${value}%`;
        }
    }

    function hideLoadingOverlay() {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }

        // Complete the progress bar
        updateProgress(100);

        // Fade out after a brief moment
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
        }, 300);
    }

    // Skeleton screen templates
    function createSkeletonCard() {
        return `
            <div class="skeleton-container">
                <div class="skeleton-item skeleton-title"></div>
                <div class="skeleton-item skeleton-text"></div>
                <div class="skeleton-item skeleton-text medium"></div>
                <div class="skeleton-item skeleton-text short"></div>
            </div>
        `;
    }

    function createSkeletonList(count = 3) {
        let html = '<div class="skeleton-container">';
        for (let i = 0; i < count; i++) {
            html += '<div class="skeleton-item skeleton-card"></div>';
        }
        html += '</div>';
        return html;
    }

    // Show skeleton in a container
    function showSkeleton(containerId, type = 'card') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const skeleton = type === 'list' ? createSkeletonList() : createSkeletonCard();
        container.setAttribute('data-original-content', container.innerHTML);
        container.innerHTML = skeleton;
    }

    // Remove skeleton and restore content
    function hideSkeleton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const original = container.getAttribute('data-original-content');
        if (original) {
            container.innerHTML = original;
            container.removeAttribute('data-original-content');
        }
    }

    // Initialize loading overlay
    function init() {
        // Only create if 3D container exists
        const container = document.getElementById('container');
        if (container) {
            createLoadingOverlay();
            console.log('⏳ Loading overlay created');
        }

        // Listen for app ready to hide loading
        window.addEventListener('appReady', () => {
            hideLoadingOverlay();
            console.log('✅ Loading complete, hiding overlay');
        }, { once: true });

        // Fallback: hide after 8 seconds no matter what
        setTimeout(() => {
            if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
                console.warn('⚠️ Loading timeout - hiding overlay');
                hideLoadingOverlay();
            }
        }, 8000);
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.LoadingStates = {
        showOverlay: createLoadingOverlay,
        hideOverlay: hideLoadingOverlay,
        showSkeleton: showSkeleton,
        hideSkeleton: hideSkeleton,
        createSkeletonCard: createSkeletonCard,
        createSkeletonList: createSkeletonList,
        updateProgress: updateProgress
    };
})();
