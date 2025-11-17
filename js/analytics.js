// Client-Side Analytics Tracking
// Tracks user interactions and sends them to the analytics server

(function() {
    'use strict';

    const ANALYTICS_BASE = (window.ANALYTICS_ENDPOINT || '/api/analytics').replace(/\/+$/, '');
    const IS_PHP_BACKEND = /\/php\//.test(ANALYTICS_BASE) || ANALYTICS_BASE.endsWith('.php');
    const FLOW_MAX_LENGTH = 160;
    
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('analyticsSessionId', sessionId);
    }

    // Generate unique session ID
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function buildEndpoint(path) {
        const base = ANALYTICS_BASE;

        if (!path) {
            return base;
        }

        const sanitizedPath = path.startsWith('/') ? path : `/${path}`;

        if (sanitizedPath.endsWith('.php')) {
            return `${base}${sanitizedPath}`;
        }

        if (IS_PHP_BACKEND) {
            return `${base}${sanitizedPath}.php`;
        }

        if (base.endsWith('.php')) {
            return base;
        }

        return `${base}${sanitizedPath}`;
    }

    function truncate(text, limit = FLOW_MAX_LENGTH) {
        if (!text) return '';
        const str = text.toString();
        return str.length > limit ? `${str.substring(0, limit - 1)}…` : str;
    }

    function deriveElementLabel(element, fallbackText) {
        if (!element || typeof element.getAttribute !== 'function') {
            return fallbackText || null;
        }

        const attributeKeys = [
            'data-analytics-label',
            'data-track-label',
            'data-track',
            'aria-label',
            'title',
            'name',
        ];

        for (const key of attributeKeys) {
            const value = element.getAttribute(key);
            if (value) {
                return value;
            }
        }

        if (fallbackText) {
            return fallbackText;
        }

        if (element.textContent) {
            const trimmed = element.textContent.trim().replace(/\s+/g, ' ');
            if (trimmed) {
                return trimmed;
            }
        }

        if (element.value) {
            return element.value.toString();
        }

        return element.tagName ? element.tagName.toLowerCase() : null;
    }

    function buildFlowLabel(type, payload = {}) {
        switch (type) {
            case 'click': {
                const parts = [];
                if (payload.elementId) parts.push(`#${payload.elementId}`);
                if (payload.dataTrack) parts.push(payload.dataTrack);
                if (payload.elementLabel) parts.push(`"${payload.elementLabel}"`);
                const descriptor = parts.length > 0 ? parts.join(' ') : payload.elementType || 'element';
                return truncate(`click:${descriptor}`);
            }
            case 'search': {
                const query = payload.query ? ` "${payload.query}"` : '';
                const resultsSuffix = typeof payload.resultsCount === 'number'
                    ? ` (${payload.resultsCount} hits)`
                    : '';
                return truncate(`search:${query}${resultsSuffix}`);
            }
            case 'pageview': {
                const title = payload.title || '';
                const path = payload.pageUrl || window.location.pathname;
                return truncate(`page:${title ? ` "${title}"` : ''} ${path}`);
            }
            case 'time':
                return truncate(`time:${payload.duration || 0}s`);
            default:
                return truncate(`${type}:${payload.label || ''}`);
        }
    }

    // Get user agent
    function getUserAgent() {
        return navigator.userAgent;
    }

    // Get screen dimensions
    function getScreenDimensions() {
        return {
            width: window.screen.width,
            height: window.screen.height
        };
    }

    // Log click event
    function logClick(event) {
        const target = (event && event.target) || (event && event.currentTarget) || event;
        const element = findRelevantElement(target);
        
        if (!element) {
            console.log('📊 Click ignored - no relevant element found');
            return;
        }

        console.log('📊 Logging click on:', element);
        const screen = getScreenDimensions();
        const elementText = getElementText(element);
        const elementType = element?.tagName ? element.tagName.toLowerCase() : 'unknown';
        const elementLabel = deriveElementLabel(element, elementText);
        const dataTrackValue = element?.getAttribute?.('data-track');

        const data = {
            elementId: element.id || null,
            elementType,
            elementText,
            pageUrl: window.location.href,
            sessionId: sessionId,
            userAgent: getUserAgent(),
            screenWidth: screen.width,
            screenHeight: screen.height,
            clickX: typeof event?.clientX === 'number' ? event.clientX : null,
            clickY: typeof event?.clientY === 'number' ? event.clientY : null,
            flowLabel: buildFlowLabel('click', {
                elementId: element.id,
                elementLabel,
                elementType,
                dataTrack: dataTrackValue
            })
        };

        sendAnalytics('/click', data);
    }

    // Find the most relevant element (button, link, etc.)
    function findRelevantElement(target) {
        // Look for interactive elements
        const relevantTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
        
        let element = target;
        let depth = 0;
        const maxDepth = 5;

        while (element && depth < maxDepth) {
            if (relevantTags.includes(element.tagName)) {
                return element;
            }
            
            // Check if element has a data-track attribute
            if (element.hasAttribute('data-track')) {
                return element;
            }
            
            // Check if element has an ID or specific classes
            if (element.id || 
                element.classList.contains('tab-btn') ||
                element.classList.contains('search-result-item') ||
                element.classList.contains('calc-btn') ||
                element.classList.contains('mode-btn')) {
                return element;
            }
            
            element = element.parentElement;
            depth++;
        }

        // If no specific element found, return the original target
        return target.id || target.classList.length > 0 ? target : null;
    }

    // Get readable text from element
    function getElementText(element) {
        // Try different methods to get text
        if (element.getAttribute('title')) {
            return element.getAttribute('title');
        }
        
        if (element.getAttribute('aria-label')) {
            return element.getAttribute('aria-label');
        }
        
        if (element.value) {
            return element.value.substring(0, 50); // Limit length
        }
        
        const text = element.textContent || element.innerText;
        return text ? text.trim().substring(0, 100) : null; // Limit length
    }

    // Log page view
    function logPageView() {
        console.log('📊 Logging page view...');
        const data = {
            pageUrl: window.location.href,
            sessionId: sessionId,
            userAgent: getUserAgent(),
            referrer: document.referrer || null,
            flowLabel: buildFlowLabel('pageview', {
                pageUrl: window.location.pathname,
                title: document.title
            })
        };

        sendAnalytics('/pageview', data);
    }

    // Log search query
    function logSearch(query, resultsCount) {
        const data = {
            query: query,
            resultsCount: resultsCount || 0,
            sessionId: sessionId,
            flowLabel: buildFlowLabel('search', {
                query,
                resultsCount: resultsCount || 0
            })
        };

        sendAnalytics('/search', data);
    }

    // Send analytics data to server
    async function sendAnalytics(endpoint, data) {
        try {
            const url = buildEndpoint(endpoint);
            console.log('📊 Sending analytics to:', url, data);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                console.error('❌ Analytics request failed:', response.status, await response.text());
            } else {
                console.log('✅ Analytics sent successfully');
            }
        } catch (error) {
            console.error('❌ Analytics error:', error.message, error);
        }
    }

    // Debounce function for search tracking
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize analytics tracking
    function initAnalytics() {
        console.log('📊 Analytics tracking initialized');
        console.log('📊 Session ID:', sessionId);
        console.log('📊 API Endpoint:', ANALYTICS_BASE);
        
        // Log page view
        logPageView();
        
        // Track all clicks on the page
        document.addEventListener('click', logClick, true);
        
        // Track search queries
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const debouncedSearch = debounce((event) => {
                const query = event.target.value.trim();
                if (query.length > 0) {
                    // Count results
                    const results = document.querySelectorAll('#search-results .search-result-item');
                    logSearch(query, results.length);
                }
            }, 1000);
            
            searchInput.addEventListener('input', debouncedSearch);
        }
        
        // Track page visibility changes (user leaving/returning)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.debug('📊 User left page');
            } else {
                console.debug('📊 User returned to page');
            }
        });
        
        // Track time on page (send on unload)
        const startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.debug(`📊 Time on page: ${timeSpent}s`);
            
            // Could send time-on-page metric here
            // Using sendBeacon for reliability during unload
            const data = {
                pageUrl: window.location.href,
                sessionId: sessionId,
                timeSpent: timeSpent,
                flowLabel: buildFlowLabel('time', { duration: timeSpent })
            };
            
            if (navigator.sendBeacon) {
                const beaconUrl = buildEndpoint('/pageview');
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                navigator.sendBeacon(beaconUrl, blob);
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnalytics);
    } else {
        initAnalytics();
    }

    // Export for external use
    window.Analytics = {
        logClick: (element) => {
            logClick({ target: element, clientX: 0, clientY: 0 });
        },
        logSearch: logSearch,
        sessionId: sessionId
    };
})();
