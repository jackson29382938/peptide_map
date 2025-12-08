// Study Quality Indicators Enhancement
// Adds study type badges and evidence levels to research studies

(function () {
    'use strict';

    // Study type detection based on content keywords
    const typePatterns = {
        human: /phase\s*(i|ii|iii|iv|1|2|3|4)|clinical\s*trial|participants?|patients?|randomized|double-blind|placebo-controlled|adults?|cohort|human/i,
        animal: /mice|mouse|rat|murine|rodent|animal\s*model|in\s*vivo|mammalian/i,
        invitro: /in\s*vitro|cell\s*line|cultured?\s*cells?|petri|laboratory|cell\s*culture/i,
        review: /review|meta-analysis|systematic|overview|literature/i
    };

    // Evidence level scoring
    const evidenceLevels = {
        human: 5,
        review: 4,
        animal: 3,
        invitro: 2
    };

    // Detect study type from text
    function detectStudyType(text) {
        text = text.toLowerCase();

        // Priority order: human > animal > invitro > review
        if (typePatterns.human.test(text)) return 'human';
        if (typePatterns.review.test(text)) return 'review';
        if (typePatterns.animal.test(text)) return 'animal';
        if (typePatterns.invitro.test(text)) return 'invitro';

        return 'review'; // Default
    }

    // Create badge HTML
    function createBadge(type) {
        const labels = {
            human: 'Human',
            animal: 'Animal',
            invitro: 'In Vitro',
            review: 'Review'
        };

        return `<span class="study-badge study-badge-${type}">${labels[type]}</span>`;
    }

    // Create evidence level indicator
    function createEvidenceLevel(type) {
        const level = evidenceLevels[type] || 2;
        let html = '<span class="study-evidence-level" title="Evidence Level ' + level + '/5">';
        for (let i = 1; i <= 5; i++) {
            html += `<span class="evidence-dot${i <= level ? ' filled' : ''}"></span>`;
        }
        html += '</span>';
        return html;
    }

    // Enhance a study card with badges
    function enhanceStudyCard(card) {
        if (card.dataset.enhanced) return;

        const titleEl = card.querySelector('.study-name, .study-title, h3, h4');
        if (!titleEl) return;

        const text = card.innerText || card.textContent;
        const type = detectStudyType(text);

        // Add badge after title
        const badge = document.createElement('span');
        badge.innerHTML = createBadge(type) + createEvidenceLevel(type);
        titleEl.appendChild(badge);

        card.dataset.enhanced = 'true';
        card.dataset.studyType = type;
    }

    // Observe studies panel for new cards
    function observeStudiesPanel() {
        const studiesContainer = document.getElementById('studies-list') ||
            document.querySelector('.studies-list');

        if (!studiesContainer) {
            setTimeout(observeStudiesPanel, 1000);
            return;
        }

        // Enhance existing cards
        studiesContainer.querySelectorAll('.study-card, .study-item').forEach(enhanceStudyCard);

        // Watch for new cards
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList?.contains('study-card') || node.classList?.contains('study-item')) {
                            enhanceStudyCard(node);
                        }
                        node.querySelectorAll?.('.study-card, .study-item').forEach(enhanceStudyCard);
                    }
                });
            });
        });

        observer.observe(studiesContainer, { childList: true, subtree: true });
        console.log('📊 Study quality indicators initialized');
    }

    // Add filter functionality
    function addStudyFilter() {
        const studiesPanel = document.getElementById('studies-panel');
        if (!studiesPanel) return;

        const header = studiesPanel.querySelector('.studies-header');
        if (!header || header.querySelector('.study-type-filter')) return;

        const filterContainer = document.createElement('div');
        filterContainer.className = 'study-type-filter';
        filterContainer.innerHTML = `
            <button class="study-type-btn active" data-type="all">All</button>
            <button class="study-type-btn" data-type="human">🟢 Human</button>
            <button class="study-type-btn" data-type="animal">🟡 Animal</button>
            <button class="study-type-btn" data-type="invitro">🔵 In Vitro</button>
            <button class="study-type-btn" data-type="review">⚪ Review</button>
        `;

        header.after(filterContainer);

        filterContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('study-type-btn')) return;

            const type = e.target.dataset.type;

            // Update active button
            filterContainer.querySelectorAll('.study-type-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === type);
            });

            // Filter cards
            const container = document.getElementById('studies-list') ||
                document.querySelector('.studies-list');
            if (!container) return;

            container.querySelectorAll('.study-card, .study-item').forEach(card => {
                if (type === 'all') {
                    card.style.display = '';
                } else {
                    card.style.display = card.dataset.studyType === type ? '' : 'none';
                }
            });
        });
    }

    // Initialize
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                observeStudiesPanel();
                setTimeout(addStudyFilter, 1500);
            });
        } else {
            observeStudiesPanel();
            setTimeout(addStudyFilter, 1500);
        }
    }

    init();

    // Export
    window.StudyQuality = {
        detectType: detectStudyType,
        enhance: enhanceStudyCard
    };
})();
