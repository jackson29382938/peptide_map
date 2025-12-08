// Keyboard Navigation Module
// Handles keyboard shortcuts for navigating the website

(function () {
    'use strict';

    // Track current focus index for navigable elements
    let currentFocusIndex = -1;
    let navigableElements = [];
    let searchResultIndex = -1;

    // Initialize keyboard navigation
    function initKeyboardNav() {
        console.log('🎹 Initializing keyboard navigation...');

        // Update navigable elements list
        updateNavigableElements();

        // Add global keyboard event listener
        document.addEventListener('keydown', handleKeyPress);

        // Update navigable elements when search results change
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            const observer = new MutationObserver(updateNavigableElements);
            observer.observe(searchResults, { childList: true, subtree: true });
        }

        console.log('✅ Keyboard navigation initialized');
    }

    // Update list of navigable elements
    function updateNavigableElements() {
        navigableElements = [
            // Buttons
            document.getElementById('search-toggle'),
            document.getElementById('calc-toggle'),
            document.getElementById('theme-toggle'),
            document.getElementById('tab-toggle'),

            // Search bar
            document.getElementById('search-input'),

            // Tab buttons
            ...document.querySelectorAll('.tab-btn'),

            // Search results (if visible)
            ...document.querySelectorAll('#search-results .search-result-item'),

            // Calculator elements (if visible)
            document.getElementById('peptide-amount'),
            document.getElementById('bac-water'),
            document.getElementById('peptide-dose'),
        ].filter(el => el && isElementVisible(el));
    }

    // Check if element is visible
    function isElementVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            element.offsetParent !== null;
    }

    // Handle keyboard events
    function handleKeyPress(event) {
        const key = event.key;
        const target = event.target;

        // Global shortcuts (work anywhere)
        switch (key) {
            case 'Escape':
                handleEscape();
                event.preventDefault();
                break;

            case '/':
                // Quick search activation (like GitHub)
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    toggleSearch();
                    event.preventDefault();
                }
                break;

            case 't':
                // Toggle theme (when not in input)
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    document.getElementById('theme-toggle')?.click();
                    event.preventDefault();
                }
                break;

            case 'm':
                // Toggle menu/tab panel (when not in input)
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    document.getElementById('tab-toggle')?.click();
                    event.preventDefault();
                }
                break;
        }

        // Navigation in search results
        if (isSearchOpen()) {
            handleSearchNavigation(event);
        }

        // General tab navigation
        if (key === 'Tab') {
            // Allow natural tab behavior but update our tracking
            setTimeout(updateNavigableElements, 0);
        }

        // Arrow key navigation when not in text input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            handleArrowNavigation(event);
        }
    }

    // Handle Escape key
    function handleEscape() {
        const calcModal = document.getElementById('calc-modal');
        const searchContainer = document.getElementById('search-container');
        const sidePanel = document.getElementById('side-panel');

        // Close calculator if open
        if (calcModal && !calcModal.classList.contains('hidden')) {
            document.getElementById('calc-close')?.click();
            return;
        }

        // Close search if open
        if (searchContainer && !searchContainer.classList.contains('collapsed')) {
            document.getElementById('search-toggle')?.click();
            document.getElementById('search-input').value = '';
            document.getElementById('search-results').innerHTML = '';
            return;
        }

        // Clear side panel selection
        if (sidePanel && sidePanel.classList.contains('visible')) {
            sidePanel.classList.remove('visible');
            return;
        }

        // Remove focus from current element
        document.activeElement?.blur();
    }

    // Toggle search
    function toggleSearch() {
        const searchToggle = document.getElementById('search-toggle');
        const searchInput = document.getElementById('search-input');

        if (searchToggle) {
            searchToggle.click();
            // Focus search input after a short delay
            setTimeout(() => searchInput?.focus(), 100);
        }
    }

    // Toggle calculator
    function toggleCalculator() {
        const calcToggle = document.getElementById('calc-toggle');
        if (calcToggle) {
            calcToggle.click();
        }
    }

    // Check if search is open
    function isSearchOpen() {
        const searchContainer = document.getElementById('search-container');
        return searchContainer && !searchContainer.classList.contains('collapsed');
    }

    // Handle navigation in search results
    function handleSearchNavigation(event) {
        const key = event.key;
        const searchResults = document.querySelectorAll('#search-results .search-result-item');

        if (searchResults.length === 0) return;

        switch (key) {
            case 'ArrowDown':
                searchResultIndex = Math.min(searchResultIndex + 1, searchResults.length - 1);
                highlightSearchResult(searchResults);
                event.preventDefault();
                break;

            case 'ArrowUp':
                searchResultIndex = Math.max(searchResultIndex - 1, -1);
                if (searchResultIndex === -1) {
                    // Return focus to search input
                    document.getElementById('search-input')?.focus();
                    removeSearchHighlight(searchResults);
                } else {
                    highlightSearchResult(searchResults);
                }
                event.preventDefault();
                break;

            case 'Enter':
                if (searchResultIndex >= 0 && searchResultIndex < searchResults.length) {
                    searchResults[searchResultIndex].click();
                    event.preventDefault();
                }
                break;
        }
    }

    // Highlight search result
    function highlightSearchResult(searchResults) {
        // Remove previous highlights
        removeSearchHighlight(searchResults);

        // Add highlight to current
        if (searchResultIndex >= 0 && searchResultIndex < searchResults.length) {
            const currentResult = searchResults[searchResultIndex];
            currentResult.style.background = 'rgba(59, 130, 246, 0.3)';
            currentResult.style.outline = '2px solid #3b82f6';
            currentResult.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    // Remove search highlight
    function removeSearchHighlight(searchResults) {
        searchResults.forEach(result => {
            result.style.background = '';
            result.style.outline = '';
        });
    }

    // Handle arrow key navigation for general elements
    function handleArrowNavigation(event) {
        const key = event.key;

        // Only handle if no modal is open
        const calcModal = document.getElementById('calc-modal');
        if (calcModal && !calcModal.classList.contains('hidden')) return;

        switch (key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                // Navigate tabs if tab panel is open
                const tabPanel = document.getElementById('tab-panel');
                if (tabPanel && !tabPanel.classList.contains('collapsed')) {
                    navigateTabs(key === 'ArrowRight' ? 1 : -1);
                    event.preventDefault();
                }
                break;
        }
    }

    // Navigate between tabs
    function navigateTabs(direction) {
        const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
        const activeTab = tabButtons.findIndex(btn => btn.classList.contains('active'));

        if (activeTab === -1) return;

        const newIndex = (activeTab + direction + tabButtons.length) % tabButtons.length;
        tabButtons[newIndex]?.click();
    }

    // Display keyboard shortcuts help in a modal
    function showKeyboardHelp() {
        const shortcuts = [
            { key: '/', action: 'Open search' },
            { key: 'Esc', action: 'Close modals/panels or clear selection' },
            { key: '?', action: 'Show this help modal' },
            { key: 't', action: 'Toggle theme (dark/light)' },
            { key: 'm', action: 'Toggle menu panel' },
            { key: '↑ ↓', action: 'Navigate search results' },
            { key: 'Enter', action: 'Select highlighted result' },
            { key: '← →', action: 'Switch tabs (when panel open)' },
            { key: 'Tab', action: 'Navigate between elements' },
        ];

        // Check if modal already exists
        let modal = document.getElementById('keyboard-shortcuts-modal');

        if (!modal) {
            // Create the modal
            modal = document.createElement('div');
            modal.id = 'keyboard-shortcuts-modal';
            modal.className = 'keyboard-shortcuts-modal';
            modal.innerHTML = `
                <div class="shortcuts-content">
                    <div class="shortcuts-header">
                        <h2>⌨️ Keyboard Shortcuts</h2>
                        <button class="shortcuts-close" aria-label="Close">✕</button>
                    </div>
                    <div class="shortcuts-body">
                        ${shortcuts.map(s => `
                            <div class="shortcut-row">
                                <span class="shortcut-key">
                                    ${s.key.split(' ').map(k => `<kbd>${k}</kbd>`).join(' ')}
                                </span>
                                <span class="shortcut-action">${s.action}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Close button
            modal.querySelector('.shortcuts-close').addEventListener('click', hideKeyboardHelp);

            // Click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    hideKeyboardHelp();
                }
            });
        }

        // Show the modal
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
    }

    function hideKeyboardHelp() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        if (modal) {
            modal.classList.remove('visible');
        }
    }

    // Reset search index when search is closed
    function resetSearchIndex() {
        searchResultIndex = -1;
    }

    // Add event listener to search toggle to reset index
    document.addEventListener('DOMContentLoaded', () => {
        const searchToggle = document.getElementById('search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', resetSearchIndex);
        }

        // Add '?' shortcut to show help
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && e.target.tagName !== 'INPUT') {
                showKeyboardHelp();
                e.preventDefault();
            }
        });
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKeyboardNav);
    } else {
        initKeyboardNav();
    }

    // Export for external use
    window.KeyboardNav = {
        init: initKeyboardNav,
        showHelp: showKeyboardHelp,
        updateElements: updateNavigableElements
    };
})();
