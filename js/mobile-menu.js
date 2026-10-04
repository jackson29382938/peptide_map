// Mobile Menu Module
// Hamburger menu for mobile/tablet devices (≤768px)

(function () {
    'use strict';

    const MOBILE_BREAKPOINT = 768;

    // Menu items configuration - maps to existing toggle buttons
    const menuItems = [
        { id: 'search-toggle', icon: '🔍', label: 'Search' },
        { id: 'calc-toggle', icon: '🧮', label: 'Calculator' },
        { id: 'theme-toggle', icon: '🌓', label: 'Theme', isTheme: true },
        { id: 'peptide-analysis-toggle', icon: '📄', label: 'Peptide Analysis' },
        { id: 'studies-toggle', icon: '📚', label: 'Research Studies' },
        { id: 'companies-toggle', icon: '🏢', label: 'Vendors' },
        { id: 'quiz-toggle', icon: '🧩', label: 'Quiz' },
        { id: 'contact-toggle', icon: '✉️', label: 'Contact' },
        { id: 'new-panel-toggle', icon: '💊', label: 'Peptides Database' },
        { id: 'bpc157-toggle', icon: '📊', label: 'BPC-157 Dashboard' },
        { id: 'compare-toggle', icon: '⚖️', label: 'Compare Peptides' },
        { id: 'journal-toggle', icon: '📓', label: 'Journal' },
        { id: 'chat-toggle', icon: '🤖', label: 'Peptide Q&A' },
        { id: 'saved-toggle', icon: '📍', label: 'Saved Locations' },
        { id: 'tab-toggle', icon: '☰', label: 'Injection Info' }
    ];

    let hamburgerBtn = null;
    let mobileDrawer = null;
    let overlay = null;
    let isDrawerOpen = false;

    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    function createMobileMenu() {
        // Create hamburger button
        hamburgerBtn = document.createElement('button');
        hamburgerBtn.id = 'mobile-hamburger';
        hamburgerBtn.className = 'mobile-hamburger';
        hamburgerBtn.setAttribute('aria-label', 'Open menu');
        hamburgerBtn.setAttribute('aria-controls', 'mobile-drawer');
        hamburgerBtn.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        document.body.appendChild(hamburgerBtn);

        // Create overlay
        overlay = document.createElement('div');
        overlay.id = 'mobile-overlay';
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        // Create drawer
        mobileDrawer = document.createElement('div');
        mobileDrawer.id = 'mobile-drawer';
        mobileDrawer.className = 'mobile-drawer';

        const drawerContent = `
            <div class="mobile-drawer-header">
                <h2>Menu</h2>
                <button class="mobile-drawer-close" aria-label="Close menu">✕</button>
            </div>
            <nav class="mobile-drawer-nav">
                <button class="mobile-menu-item" id="mobile-close-panel" hidden>
                    <span class="mobile-menu-icon">✕</span>
                    <span class="mobile-menu-label">Close current panel</span>
                </button>
                ${menuItems.map(item => `
                    <button class="mobile-menu-item" data-target="${item.id}">
                        <span class="mobile-menu-icon">${item.icon}</span>
                        <span class="mobile-menu-label">${item.label}</span>
                    </button>
                `).join('')}
            </nav>
            <div class="mobile-drawer-footer">
                <button class="mobile-menu-item" id="mobile-restart-tutorial">
                    <span class="mobile-menu-icon">❓</span>
                    <span class="mobile-menu-label">Restart Tutorial</span>
                </button>
            </div>
        `;
        mobileDrawer.innerHTML = drawerContent;
        document.body.appendChild(mobileDrawer);

        // Event listeners
        hamburgerBtn.addEventListener('click', toggleDrawer);
        overlay.addEventListener('click', closeDrawer);
        mobileDrawer.querySelector('.mobile-drawer-close').addEventListener('click', closeDrawer);

        // Menu item clicks
        mobileDrawer.querySelectorAll('.mobile-menu-item[data-target]').forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.dataset.target;
                const targetBtn = document.getElementById(targetId);
                if (targetBtn) {
                    closeDrawer();
                    // Small delay to let drawer close animation start
                    setTimeout(() => targetBtn.click(), 150);
                }
            });
        });

        // Close whichever panel is open (the desktop toggle buttons are hidden on mobile)
        const closePanelBtn = mobileDrawer.querySelector('#mobile-close-panel');
        closePanelBtn.addEventListener('click', () => {
            closeDrawer();
            openPanelToggles().forEach(btn => setTimeout(() => btn.click(), 150));
        });

        // Restart tutorial button
        const restartBtn = mobileDrawer.querySelector('#mobile-restart-tutorial');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                closeDrawer();
                if (typeof window.startOnboarding === 'function') {
                    setTimeout(() => window.startOnboarding(), 200);
                }
            });
        }

        // Handle window resize
        window.addEventListener('resize', handleResize);

        // Initial state
        handleResize();
    }

    function toggleDrawer() {
        if (isDrawerOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    // Toggle buttons whose panel is currently open
    function openPanelToggles() {
        const pairs = [
            ['tab-panel', 'tab-toggle'], ['studies-panel', 'studies-toggle'], ['companies-panel', 'companies-toggle'],
            ['quiz-panel', 'quiz-toggle'], ['calc-panel', 'calc-toggle'], ['contact-panel', 'contact-toggle'],
            ['new-panel', 'new-panel-toggle'], ['bpc157-panel', 'bpc157-toggle'], ['compare-panel', 'compare-toggle'],
            ['journal-panel', 'journal-toggle'], ['chat-panel', 'chat-toggle'], ['saved-locations-panel', 'saved-toggle']
        ];
        return pairs
            .map(([panelId, toggleId]) => {
                const panel = document.getElementById(panelId);
                const toggle = document.getElementById(toggleId);
                return panel && toggle && !panel.classList.contains('collapsed') ? toggle : null;
            })
            .filter(Boolean);
    }

    function openDrawer() {
        const closeItem = mobileDrawer.querySelector('#mobile-close-panel');
        if (closeItem) closeItem.hidden = openPanelToggles().length === 0;
        isDrawerOpen = true;
        mobileDrawer.classList.add('open');
        overlay.classList.add('visible');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        isDrawerOpen = false;
        mobileDrawer.classList.remove('open');
        overlay.classList.remove('visible');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    }

    function handleResize() {
        const mobile = isMobile();

        // Show/hide hamburger
        if (hamburgerBtn) {
            hamburgerBtn.style.display = mobile ? 'flex' : 'none';
        }

        // Hide drawer if switching to desktop
        if (!mobile && isDrawerOpen) {
            closeDrawer();
        }

        // Toggle visibility of desktop toggle buttons
        const desktopToggles = document.querySelectorAll('.left-toggle, .right-toggle');
        desktopToggles.forEach(btn => {
            if (btn.id !== 'mobile-hamburger') {
                btn.classList.toggle('hide-on-mobile', mobile);
            }
        });
    }

    // Initialize when DOM is ready
    function init() {
        createMobileMenu();
        console.log('📱 Mobile menu initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.MobileMenu = {
        open: openDrawer,
        close: closeDrawer,
        toggle: toggleDrawer,
        isMobile: isMobile
    };
})();
