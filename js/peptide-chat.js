// Peptide Chat Module
// AI-powered Q&A using pattern matching from peptide database

(function () {
    'use strict';

    let chatPanel = null;
    let messages = [];
    let isInitialized = false;

    // Knowledge base built from peptide database
    let knowledgeBase = {};

    // Build knowledge base from peptide data
    function buildKnowledgeBase() {
        if (typeof window.PEPTIDES_DATABASE === 'undefined') return;

        Object.entries(window.PEPTIDES_DATABASE).forEach(([id, peptide]) => {
            knowledgeBase[id] = {
                names: [
                    id,
                    peptide.fullName,
                    ...(peptide.shortcuts || [])
                ].filter(n => n).map(n => n.toLowerCase()),
                category: peptide.category || '',
                benefits: peptide.benefits || [],
                sideEffects: peptide.sideEffects || [],
                dose: peptide.dose || '',
                protocol: peptide.protocol || '',
                administration: peptide.administration || '',
                forms: peptide.forms || [],
                fullName: peptide.fullName
            };
        });
    }

    // Find peptide by name/alias
    function findPeptide(query) {
        const q = query.toLowerCase();

        for (const [id, data] of Object.entries(knowledgeBase)) {
            if (data.names.some(name => q.includes(name) || name.includes(q))) {
                return { id, ...data };
            }
        }
        return null;
    }

    // Intent detection
    function detectIntent(query) {
        const q = query.toLowerCase();

        const intents = {
            benefits: /what (is|are|does)|benefits|help|good for|treats|healing|improve/i,
            dosing: /dose|dosing|how much|dosage|amount|mcg|mg/i,
            sideEffects: /side effect|danger|risk|safe|harmful|bad/i,
            compare: /compare|vs|versus|difference|better|best/i,
            howTo: /how to|inject|use|take|administer|reconstitut/i,
            category: /type|category|kind|class/i,
            forms: /form|available|buy|get|purchase|pill|capsule|inject/i,
            general: /what is|tell me about|explain|describe/i
        };

        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(q)) {
                return intent;
            }
        }
        return 'general';
    }

    // Generate response based on intent and peptide
    function generateResponse(query) {
        const intent = detectIntent(query);
        const peptide = findPeptide(query);

        // Check for comparison queries
        if (intent === 'compare') {
            const peptideNames = Object.values(knowledgeBase)
                .flatMap(p => p.names)
                .filter(n => query.toLowerCase().includes(n));

            if (peptideNames.length >= 2) {
                return `For a detailed comparison, I recommend using the **Peptide Comparison Tool** (⚖️ button on the left sidebar). Select the peptides you want to compare for a side-by-side analysis of their benefits, dosing, and mechanisms.`;
            }
        }

        if (!peptide) {
            return getGeneralHelp(query);
        }

        switch (intent) {
            case 'benefits':
                return formatBenefits(peptide);
            case 'dosing':
                return formatDosing(peptide);
            case 'sideEffects':
                return formatSideEffects(peptide);
            case 'howTo':
                return formatHowTo(peptide);
            case 'forms':
                return formatForms(peptide);
            case 'category':
                return `**${peptide.fullName}** is categorized as: ${peptide.category || 'General peptide'}`;
            default:
                return formatGeneral(peptide);
        }
    }

    function formatBenefits(peptide) {
        if (!peptide.benefits || peptide.benefits.length === 0) {
            return `I don't have detailed benefit information for ${peptide.fullName}.`;
        }

        const topBenefits = peptide.benefits.slice(0, 5);
        return `**${peptide.fullName}** offers these key benefits:\n\n${topBenefits.map(b => `• ${b}`).join('\n')}\n\n${peptide.benefits.length > 5 ? `...and ${peptide.benefits.length - 5} more benefits.` : ''}`;
    }

    function formatDosing(peptide) {
        let response = `**Dosing for ${peptide.fullName}:**\n\n`;

        if (peptide.dose) {
            response += `**Typical Dose:** ${peptide.dose}\n\n`;
        }
        if (peptide.protocol) {
            response += `**Protocol:** ${peptide.protocol}\n\n`;
        }
        if (peptide.administration) {
            response += `**Administration:** ${peptide.administration}`;
        }

        response += `\n\n⚠️ *Always consult a healthcare professional before starting any peptide protocol.*`;

        return response;
    }

    function formatSideEffects(peptide) {
        if (!peptide.sideEffects || peptide.sideEffects.length === 0) {
            return `${peptide.fullName} is generally well-tolerated with minimal reported side effects. However, individual responses may vary.`;
        }

        return `**Potential side effects of ${peptide.fullName}:**\n\n${peptide.sideEffects.map(s => `• ${s}`).join('\n')}\n\n⚠️ *Consult a healthcare professional if you experience any adverse effects.*`;
    }

    function formatHowTo(peptide) {
        let response = `**How to use ${peptide.fullName}:**\n\n`;

        if (peptide.administration) {
            response += `**Administration:** ${peptide.administration}\n\n`;
        }
        if (peptide.protocol) {
            response += `**Protocol:** ${peptide.protocol}\n\n`;
        }

        response += `For detailed injection procedures, check the **Injection Info Panel** (☰ button).`;

        return response;
    }

    function formatForms(peptide) {
        if (!peptide.forms || peptide.forms.length === 0) {
            return `${peptide.fullName} is typically available as an injectable peptide.`;
        }

        return `**${peptide.fullName}** is available in these forms:\n\n${peptide.forms.slice(0, 5).map(f => `• ${f}`).join('\n')}`;
    }

    function formatGeneral(peptide) {
        let response = `**${peptide.fullName}**\n\n`;
        response += `**Category:** ${peptide.category || 'General peptide'}\n\n`;

        if (peptide.benefits && peptide.benefits.length > 0) {
            response += `**Key Benefits:**\n${peptide.benefits.slice(0, 3).map(b => `• ${b}`).join('\n')}\n\n`;
        }

        if (peptide.dose) {
            response += `**Typical Dose:** ${peptide.dose}\n\n`;
        }

        response += `Ask me about specific aspects like "dosing for ${peptide.names[0]}" or "side effects of ${peptide.names[0]}"!`;

        return response;
    }

    function getGeneralHelp(query) {
        const q = query.toLowerCase();

        // Common condition-based queries
        const conditions = {
            'muscle': ['bpc157', 'tb500', 'igf1-lr3'],
            'joint': ['bpc157', 'tb500', 'ghk-cu'],
            'gut': ['bpc157', 'kpv', 'll37'],
            'sleep': ['dsip', 'mk677', 'cjc1295-ipamorelin'],
            'fat loss': ['aod9604', '5-amino-1mq', 'mots-c'],
            'weight loss': ['aod9604', 'retatrutide', 'tirzepatide', 'semaglutide'],
            'skin': ['ghk-cu', 'epithalon', 'glutathione'],
            'hair': ['ghk-cu'],
            'anti-aging': ['epithalon', 'nad-plus', 'ghk-cu'],
            'healing': ['bpc157', 'tb500'],
            'cognitive': ['dihexa', 'nad-plus'],
            'libido': ['bremelanotide', 'kisspeptin', 'melanotan-ii']
        };

        for (const [condition, peptides] of Object.entries(conditions)) {
            if (q.includes(condition)) {
                const peptideList = peptides
                    .map(id => knowledgeBase[id]?.fullName || id)
                    .join(', ');
                return `For **${condition}**, commonly recommended peptides include:\n\n${peptideList}\n\nWould you like more details about any of these?`;
            }
        }

        // Default response
        return `I can help you learn about peptides! Try asking:\n\n• "What is BPC-157?"\n• "Dosing for CJC-1295/Ipamorelin"\n• "Side effects of Semaglutide"\n• "Best peptides for healing"\n• "Compare BPC-157 vs TB-500"\n\nOr explore the **Peptides Database** (💊) for the full list!`;
    }

    // Create chat panel
    function createChatPanel() {
        if (document.getElementById('chat-panel')) return;

        chatPanel = document.createElement('div');
        chatPanel.id = 'chat-panel';
        chatPanel.className = 'collapsed';
        chatPanel.innerHTML = `
            <div id="chat-drag-handle" title="Drag to adjust panel width"></div>
            <div class="studies-header">
                <h2 class="studies-title">🤖 Peptide Q&A</h2>
                <div class="studies-meta">
                    <span>Ask me anything about peptides</span>
                </div>
            </div>
            <div id="chat-container" class="studies-list">
                <div class="chat-messages" id="chat-messages"></div>
                <div class="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Ask about peptides..." autocomplete="off">
                    <button id="chat-send" title="Send">➤</button>
                </div>
            </div>
        `;
        document.body.appendChild(chatPanel);

        // Get toggle button
        const toggleBtn = document.getElementById('chat-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel(chatPanel, toggleBtn);
            }
        });

        // Chat input handlers
        document.getElementById('chat-send').addEventListener('click', sendMessage);
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Initial greeting
        addMessage('bot', getGeneralHelp(''));
    }

    function sendMessage() {
        const input = document.getElementById('chat-input');
        const query = input.value.trim();

        if (!query) return;

        // Add user message
        addMessage('user', query);
        input.value = '';

        // Generate and add response (with slight delay for UX)
        setTimeout(() => {
            const response = generateResponse(query);
            addMessage('bot', response);
        }, 300);
    }

    function addMessage(type, content) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `chat-message chat-message-${type}`;

        // Convert markdown-style formatting
        const formatted = content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '&bull; ');

        messageEl.innerHTML = `
            <div class="chat-message-content">${formatted}</div>
        `;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        messages.push({ type, content, timestamp: Date.now() });
    }

    // Initialize
    function init() {
        if (isInitialized) return;

        const checkReady = () => {
            if (typeof window.PEPTIDES_DATABASE !== 'undefined' &&
                Object.keys(window.PEPTIDES_DATABASE).length > 0) {
                buildKnowledgeBase();
                createChatPanel();
                isInitialized = true;
                console.log('🤖 Peptide Chat initialized');
            } else {
                setTimeout(checkReady, 500);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkReady);
        } else {
            checkReady();
        }
    }

    init();

    // Export for external use
    window.PeptideChat = {
        toggle: () => {
            const p = document.getElementById('chat-panel');
            const t = document.getElementById('chat-toggle');
            if (p && t && typeof window.togglePanel === 'function') window.togglePanel(p, t);
        },
        ask: (query) => {
            const response = generateResponse(query);
            addMessage('user', query);
            setTimeout(() => addMessage('bot', response), 100);
            return response;
        },
        clear: () => {
            messages = [];
            const container = document.getElementById('chat-messages');
            if (container) container.innerHTML = '';
            addMessage('bot', getGeneralHelp(''));
        }
    };
})();
