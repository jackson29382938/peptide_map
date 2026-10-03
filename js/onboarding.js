// Onboarding Tutorial Module
// First-visit walkthrough to guide users through key features

(function () {
    'use strict';

    const STORAGE_KEY = 'hasSeenOnboarding';

    // Tutorial steps configuration - ordered top to bottom as buttons appear on screen
    const tutorialSteps = [
        {
            target: '#container',
            title: 'Welcome to Body Map Peptides! 👋',
            content: 'This interactive 3D body map helps you explore peptides, injection points, and get personalized recommendations.',
            position: 'center',
            highlight: false
        },
        {
            target: '#container canvas',
            title: '3D Body Model 🧍',
            content: 'Click and drag to rotate the model. Click on any muscle region to see injection information and related peptides.',
            position: 'right',
            highlight: true
        },
        {
            target: '#tab-toggle',
            title: 'Injection Info Panel ☰',
            content: 'Detailed injection procedures, types, and comprehensive peptide analysis guides.',
            position: 'right',
            highlight: true
        },
        {
            target: '#search-toggle',
            title: 'Search 🔍',
            content: 'Search for injuries, body parts, or peptides. Press "/" on your keyboard for quick access!',
            position: 'right',
            highlight: true
        },
        {
            target: '#calc-toggle',
            title: 'Reconstitution Calculator 🧮',
            content: 'Calculate how to mix and dose your peptides accurately. Essential for safe preparation!',
            position: 'right',
            highlight: true
        },
        {
            target: '#theme-toggle',
            title: 'Theme Toggle 🎨',
            content: 'Switch between dark and light themes for your preferred viewing experience.',
            position: 'right',
            highlight: true
        },
        {
            target: '#peptide-analysis-toggle',
            title: 'Peptide Analysis 📄',
            content: 'Access comprehensive peptide analysis with detailed research and mechanism information.',
            position: 'right',
            highlight: true
        },
        {
            target: '#studies-toggle',
            title: 'Research Studies 📚',
            content: 'Search and browse scientific research studies on peptides with community voting and comments.',
            position: 'right',
            highlight: true
        },
        {
            target: '#companies-toggle',
            title: 'Peptide Vendors 🏢',
            content: 'Find and rate peptide vendors. Add your own ratings and comments to help the community.',
            position: 'right',
            highlight: true
        },
        {
            target: '#quiz-toggle',
            title: 'Peptide Quiz 🧩',
            content: 'Answer questions about your goals and conditions to get personalized peptide stack recommendations.',
            position: 'right',
            highlight: true
        },
        {
            target: '#contact-toggle',
            title: 'Contact Us ✉️',
            content: 'Have questions or feedback? Send us a message through the contact form.',
            position: 'right',
            highlight: true
        },
        {
            target: '#new-panel-toggle',
            title: 'Peptides Database 💊',
            content: 'Browse our comprehensive database of peptides with detailed information on mechanisms, dosing, and applications.',
            position: 'right',
            highlight: true
        },
        {
            target: '#bpc157-toggle',
            title: 'BPC-157 Research Dashboard 📊',
            content: 'Interactive research publication forecast dashboard for BPC-157 peptide studies.',
            position: 'right',
            highlight: true
        },
        {
            target: '#compare-toggle',
            title: 'Compare Peptides ⚖️',
            content: 'Compare multiple peptides side by side to see their differences and similarities.',
            position: 'right',
            highlight: true
        },
        {
            target: '#journal-toggle',
            title: 'Peptide Journal 📓',
            content: 'Track your peptide usage, dosages, and experiences in your personal journal.',
            position: 'right',
            highlight: true
        },
        {
            target: '#chat-toggle',
            title: 'Peptide Q&A 🤖',
            content: 'Ask questions about peptides and get AI-powered answers based on research.',
            position: 'right',
            highlight: true
        },
        {
            target: '#saved-toggle',
            title: 'You\'re All Set! 🎉',
            content: 'Save your marked injection locations here for quick access. Press "?" anytime for keyboard shortcuts. Enjoy exploring!',
            position: 'left',
            highlight: true
        }
    ];

    let currentStep = 0;
    let overlay = null;
    let tooltip = null;
    let spotlightMask = null;

    let started = false;

    function hasSeenOnboarding() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }

    function markOnboardingSeen() {
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {
            /* storage blocked (private mode): the tutorial just shows again next visit */
        }
    }

    function isMobileLayout() {
        return window.innerWidth <= 768;
    }

    // On phones the left/right toggle buttons are folded into the hamburger menu, so
    // collapse the per-button steps into one "Menu" step instead of pointing at hidden elements.
    function getSteps() {
        if (!isMobileLayout()) return tutorialSteps;
        const isToggleStep = (step) => /-toggle$/.test(step.target);
        const steps = tutorialSteps
            .map(step => (/All Set/.test(step.title) ? { ...step, target: '#container', highlight: false, position: 'center' } : step))
            .filter(step => !isToggleStep(step));
        const menuStep = {
            target: '#mobile-hamburger',
            title: 'Menu ☰',
            content: 'Everything lives in this menu: search, the calculator, the peptides database, research studies, vendors, the quiz, comparison, your journal, Q&A, saved locations and more.',
            position: 'bottom',
            highlight: true
        };
        steps.splice(Math.min(2, steps.length), 0, menuStep);
        return steps;
    }
    let activeSteps = tutorialSteps;

    function createOnboardingElements() {
        // Main overlay container
        overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.className = 'onboarding-overlay';
        overlay.innerHTML = `
            <svg class="onboarding-mask" width="100%" height="100%">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white"/>
                        <rect id="spotlight-cutout" x="0" y="0" width="0" height="0" rx="8" fill="black"/>
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#spotlight-mask)"/>
            </svg>
        `;
        document.body.appendChild(overlay);

        spotlightMask = overlay.querySelector('#spotlight-cutout');

        // Tooltip
        tooltip = document.createElement('div');
        tooltip.id = 'onboarding-tooltip';
        tooltip.className = 'onboarding-tooltip';
        tooltip.innerHTML = `
            <div class="onboarding-tooltip-header">
                <span class="onboarding-step-counter">1 / ${activeSteps.length}</span>
                <button class="onboarding-skip" aria-label="Skip tutorial">Skip</button>
            </div>
            <h3 class="onboarding-title"></h3>
            <p class="onboarding-content"></p>
            <div class="onboarding-nav">
                <button class="onboarding-prev" disabled>← Previous</button>
                <button class="onboarding-next">Next →</button>
            </div>
            <div class="onboarding-progress">
                ${activeSteps.map((_, i) => `<div class="onboarding-dot${i === 0 ? ' active' : ''}" data-step="${i}"></div>`).join('')}
            </div>
        `;
        document.body.appendChild(tooltip);

        // Event listeners
        tooltip.querySelector('.onboarding-skip').addEventListener('click', endTutorial);
        tooltip.querySelector('.onboarding-prev').addEventListener('click', prevStep);
        tooltip.querySelector('.onboarding-next').addEventListener('click', nextStep);

        // Progress dot clicks
        tooltip.querySelectorAll('.onboarding-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                goToStep(parseInt(dot.dataset.step));
            });
        });

        // Close on escape (registered once; the handler ignores events while the tutorial is hidden)
        document.removeEventListener('keydown', handleKeydown);
        document.addEventListener('keydown', handleKeydown);
    }

    function handleKeydown(e) {
        if (!overlay || !overlay.classList.contains('visible')) return;

        if (e.key === 'Escape') {
            endTutorial();
        } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
            nextStep();
        } else if (e.key === 'ArrowLeft') {
            prevStep();
        }
    }

    function showStep(stepIndex) {
        const step = activeSteps[stepIndex];
        if (!step) return;

        currentStep = stepIndex;
        const target = document.querySelector(step.target);

        // Update counter
        tooltip.querySelector('.onboarding-step-counter').textContent = `${stepIndex + 1} / ${activeSteps.length}`;

        // Update content
        tooltip.querySelector('.onboarding-title').textContent = step.title;
        tooltip.querySelector('.onboarding-content').textContent = step.content;

        // Update navigation buttons
        const prevBtn = tooltip.querySelector('.onboarding-prev');
        const nextBtn = tooltip.querySelector('.onboarding-next');
        prevBtn.disabled = stepIndex === 0;
        nextBtn.textContent = stepIndex === activeSteps.length - 1 ? 'Finish ✓' : 'Next →';

        // Update progress dots
        tooltip.querySelectorAll('.onboarding-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === stepIndex);
            dot.classList.toggle('completed', i < stepIndex);
        });

        // Position spotlight and tooltip
        if (step.highlight && target) {
            const rect = target.getBoundingClientRect();
            const padding = 10;

            spotlightMask.setAttribute('x', rect.left - padding);
            spotlightMask.setAttribute('y', rect.top - padding);
            spotlightMask.setAttribute('width', rect.width + padding * 2);
            spotlightMask.setAttribute('height', rect.height + padding * 2);

            // Position tooltip
            positionTooltip(rect, step.position);
        } else {
            // Center position (no highlight)
            spotlightMask.setAttribute('width', 0);
            spotlightMask.setAttribute('height', 0);

            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            tooltip.style.right = 'auto';
            tooltip.style.bottom = 'auto';
        }
    }

    function positionTooltip(targetRect, position) {
        const tooltipWidth = 340;
        const tooltipHeight = tooltip.offsetHeight || 200;
        const margin = 20;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top, left;
        tooltip.style.transform = 'none';

        switch (position) {
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
                left = targetRect.right + margin;

                // Adjust if goes off screen
                if (left + tooltipWidth > viewportWidth - margin) {
                    left = targetRect.left - tooltipWidth - margin;
                }
                break;
            case 'bottom':
                top = targetRect.bottom + margin;
                left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
                break;
            case 'top':
                top = targetRect.top - tooltipHeight - margin;
                left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
                left = targetRect.left - tooltipWidth - margin;
                break;
            default:
                top = viewportHeight / 2 - tooltipHeight / 2;
                left = viewportWidth / 2 - tooltipWidth / 2;
        }

        // Keep tooltip within viewport
        top = Math.max(margin, Math.min(top, viewportHeight - tooltipHeight - margin));
        left = Math.max(margin, Math.min(left, viewportWidth - tooltipWidth - margin));

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.right = 'auto';
        tooltip.style.bottom = 'auto';
    }

    function nextStep() {
        if (currentStep < activeSteps.length - 1) {
            showStep(currentStep + 1);
        } else {
            endTutorial();
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    }

    function goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < activeSteps.length) {
            showStep(stepIndex);
        }
    }

    function startOnboarding() {
        activeSteps = getSteps();
        // Rebuild so the step counter and dots match the active step list (desktop vs mobile)
        if (overlay) overlay.remove();
        if (tooltip) tooltip.remove();
        overlay = tooltip = spotlightMask = null;
        createOnboardingElements();

        currentStep = 0;
        overlay.classList.add('visible');
        tooltip.classList.add('visible');
        document.body.style.overflow = 'hidden';

        // Small delay to ensure elements are rendered
        setTimeout(() => showStep(0), 100);
    }

    function endTutorial() {
        if (overlay) {
            overlay.classList.remove('visible');
        }
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
        document.body.style.overflow = '';
        markOnboardingSeen();
    }

    // Auto-start on first visit only
    function autoStart() {
        if (started || hasSeenOnboarding()) return;
        started = true;
        startOnboarding();
    }

    function init() {
        if (hasSeenOnboarding()) return;

        // Wait for the 3D model so visitors see it before the tutorial covers the screen
        window.addEventListener('appReady', () => setTimeout(autoStart, 500), { once: true });

        // Fallback if appReady never fires (e.g. WebGL unavailable)
        setTimeout(() => {
            if (!started) autoStart();
        }, 8000);
    }

    init();

    // Export for external use
    window.Onboarding = {
        start: () => { started = true; startOnboarding(); },
        end: endTutorial,
        reset: () => localStorage.removeItem(STORAGE_KEY)
    };

    // Alias for mobile menu
    window.startOnboarding = () => { started = true; startOnboarding(); };
})();
