// Analytics Backend Server
// Handles click tracking and analytics database

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite database
const db = new sqlite3.Database('./analytics.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables if they don't exist
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS click_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            element_id TEXT,
            element_type TEXT,
            element_text TEXT,
            page_url TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_id TEXT,
            user_agent TEXT,
            screen_width INTEGER,
            screen_height INTEGER,
            click_x INTEGER,
            click_y INTEGER,
            ip_address TEXT,
            flow_label TEXT
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating click_events table:', err.message);
        } else {
            console.log('✅ click_events table ready');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_url TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_id TEXT,
            user_agent TEXT,
            referrer TEXT,
            ip_address TEXT,
            flow_label TEXT
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating page_views table:', err.message);
        } else {
            console.log('✅ page_views table ready');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS search_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT,
            results_count INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_id TEXT,
            ip_address TEXT,
            flow_label TEXT
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating search_queries table:', err.message);
        } else {
            console.log('✅ search_queries table ready');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS session_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            event_type TEXT,
            event_detail TEXT,
            page_url TEXT,
            element_id TEXT,
            element_text TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating session_events table:', err.message);
        } else {
            console.log('✅ session_events table ready');
        }
    });

    ensureColumn('click_events', 'ip_address', 'TEXT');
    ensureColumn('click_events', 'flow_label', 'TEXT');
    ensureColumn('page_views', 'ip_address', 'TEXT');
    ensureColumn('page_views', 'flow_label', 'TEXT');
    ensureColumn('search_queries', 'ip_address', 'TEXT');
    ensureColumn('search_queries', 'flow_label', 'TEXT');
}

function ensureColumn(table, column, typeDefinition) {
    db.all(`PRAGMA table_info(${table})`, (err, columns) => {
        if (err) {
            console.error(`❌ Failed to inspect table ${table}:`, err.message);
            return;
        }
        const exists = columns.some(col => col.name === column);
        if (!exists) {
            db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDefinition}`, (alterErr) => {
                if (alterErr) {
                    console.error(`❌ Failed to add ${column} to ${table}:`, alterErr.message);
                } else {
                    console.log(`✅ Added ${column} column to ${table}`);
                }
            });
        }
    });
}

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || req.ip || null;
}

function normalizeFlowLabel(label, fallback) {
    const text = (label || fallback || '').toString().trim();
    return text.slice(0, 160);
}

function logSessionEvent({
    sessionId,
    eventType,
    eventDetail,
    pageUrl,
    elementId,
    elementText,
    ipAddress
}) {
    if (!sessionId || !eventType) {
        return;
    }

    const sql = `
        INSERT INTO session_events
        (session_id, event_type, event_detail, page_url, element_id, element_text, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        sessionId,
        eventType,
        eventDetail ? eventDetail.slice(0, 200) : null,
        pageUrl || null,
        elementId || null,
        elementText || null,
        ipAddress || null
    ], (err) => {
        if (err) {
            console.error('❌ Error logging session event:', err.message);
        }
    });
}

function buildFlowSummary(flowRows) {
    if (!Array.isArray(flowRows) || flowRows.length === 0) {
        return {
            sessionsTracked: 0,
            averageEventsPerSession: 0,
            topFlows: []
        };
    }

    const sessions = new Map();
    flowRows.forEach(row => {
        if (!row.session_id) {
            return;
        }
        if (!sessions.has(row.session_id)) {
            sessions.set(row.session_id, []);
        }
        sessions.get(row.session_id).push(row);
    });

    const flowCounts = new Map();
    let totalEvents = 0;

    sessions.forEach(events => {
        const labels = events
            .map(event => normalizeFlowLabel(event.event_detail, event.event_type))
            .filter(label => !!label);

        totalEvents += labels.length;

        if (labels.length > 0) {
            const sequence = labels.slice(0, 6).join(' → ');
            flowCounts.set(sequence, (flowCounts.get(sequence) || 0) + 1);
        }
    });

    const topFlows = Array.from(flowCounts.entries())
        .map(([sequence, count]) => ({ sequence, count }))
        .sort((a, b) => b.count - a.count || a.sequence.localeCompare(b.sequence))
        .slice(0, 12);

    const sessionsTracked = sessions.size;
    const averageEventsPerSession = sessionsTracked === 0
        ? 0
        : parseFloat((totalEvents / sessionsTracked).toFixed(2));

    return {
        sessionsTracked,
        averageEventsPerSession,
        topFlows
    };
}

// API Routes

// Log click event
app.post('/api/analytics/click', (req, res) => {
    const {
        elementId,
        elementType,
        elementText,
        pageUrl,
        sessionId,
        userAgent,
        screenWidth,
        screenHeight,
        clickX,
        clickY,
        flowLabel
    } = req.body;

    const ipAddress = getClientIp(req);
    const normalizedFlow = normalizeFlowLabel(flowLabel, elementText || elementId || elementType || 'click');

    const sql = `
        INSERT INTO click_events 
        (element_id, element_type, element_text, page_url, session_id, user_agent, 
         screen_width, screen_height, click_x, click_y, ip_address, flow_label)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        elementId,
        elementType,
        elementText,
        pageUrl,
        sessionId,
        userAgent,
        screenWidth,
        screenHeight,
        clickX,
        clickY,
        ipAddress,
        normalizedFlow
    ], function(err) {
        if (err) {
            console.error('❌ Error logging click:', err.message);
            res.status(500).json({ error: 'Failed to log click' });
        } else {
            logSessionEvent({
                sessionId,
                eventType: 'click',
                eventDetail: normalizedFlow,
                pageUrl,
                elementId,
                elementText,
                ipAddress
            });
            res.json({ success: true, id: this.lastID });
        }
    });
});

// Log page view
app.post('/api/analytics/pageview', (req, res) => {
    const { pageUrl, sessionId, userAgent, referrer, flowLabel } = req.body;

    const ipAddress = getClientIp(req);
    const normalizedFlow = normalizeFlowLabel(flowLabel, `page:${pageUrl || '/'}`);

    const sql = `
        INSERT INTO page_views (page_url, session_id, user_agent, referrer, ip_address, flow_label)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [pageUrl, sessionId, userAgent, referrer, ipAddress, normalizedFlow], function(err) {
        if (err) {
            console.error('❌ Error logging page view:', err.message);
            res.status(500).json({ error: 'Failed to log page view' });
        } else {
            logSessionEvent({
                sessionId,
                eventType: 'pageview',
                eventDetail: normalizedFlow,
                pageUrl,
                ipAddress
            });
            res.json({ success: true, id: this.lastID });
        }
    });
});

// Log search query
app.post('/api/analytics/search', (req, res) => {
    const { query, resultsCount, sessionId, flowLabel } = req.body;

    const ipAddress = getClientIp(req);
    const normalizedFlow = normalizeFlowLabel(flowLabel, query ? `search:${query}` : 'search');

    const sql = `
        INSERT INTO search_queries (query, results_count, session_id, ip_address, flow_label)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [query, resultsCount, sessionId, ipAddress, normalizedFlow], function(err) {
        if (err) {
            console.error('❌ Error logging search:', err.message);
            res.status(500).json({ error: 'Failed to log search' });
        } else {
            logSessionEvent({
                sessionId,
                eventType: 'search',
                eventDetail: normalizedFlow,
                pageUrl: null,
                elementText: query,
                ipAddress
            });
            res.json({ success: true, id: this.lastID });
        }
    });
});

// Get analytics summary
app.get('/api/analytics/summary', (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const queries = {
        totalClicks: `SELECT COUNT(*) as count FROM click_events WHERE timestamp > ?`,
        totalPageViews: `SELECT COUNT(*) as count FROM page_views WHERE timestamp > ?`,
        totalSearches: `SELECT COUNT(*) as count FROM search_queries WHERE timestamp > ?`,
        uniqueVisitors: `
            SELECT COUNT(DISTINCT ip_address) as count
            FROM page_views
            WHERE timestamp > ?
              AND ip_address IS NOT NULL
              AND ip_address != ''
        `,
        topClicks: `
            SELECT element_id, element_type, element_text, COUNT(*) as clicks
            FROM click_events
            WHERE timestamp > ?
            GROUP BY element_id, element_type, element_text
            ORDER BY clicks DESC
            LIMIT 20
        `,
        topSearches: `
            SELECT query, COUNT(*) as count
            FROM search_queries
            WHERE timestamp > ?
            GROUP BY query
            ORDER BY count DESC
            LIMIT 20
        `,
        topVisitors: `
            SELECT 
                ip_address,
                COUNT(DISTINCT session_id) AS sessions,
                COUNT(*) AS hits
            FROM page_views
            WHERE timestamp > ?
              AND ip_address IS NOT NULL
              AND ip_address != ''
            GROUP BY ip_address
            ORDER BY hits DESC
            LIMIT 15
        `,
        clicksByHour: `
            SELECT strftime('%H', timestamp) as hour, COUNT(*) as clicks
            FROM click_events
            WHERE timestamp > ?
            GROUP BY hour
            ORDER BY hour
        `,
        flowEvents: `
            SELECT session_id, event_type, event_detail, timestamp
            FROM session_events
            WHERE timestamp > ?
            ORDER BY session_id, timestamp
        `
    };

    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.all(query, [dateLimit], (err, rows) => {
            if (err) {
                console.error(`❌ Error in ${key} query:`, err.message);
                results[key] = { error: err.message };
            } else {
                if (key.startsWith('total')) {
                    results[key] = rows[0]?.count || 0;
                } else {
                    results[key] = rows;
                }
            }
            
            completed++;
            if (completed === total) {
                const flowSummary = Array.isArray(results.flowEvents)
                    ? buildFlowSummary(results.flowEvents)
                    : { sessionsTracked: 0, averageEventsPerSession: 0, topFlows: [] };
                results.flowSummary = flowSummary;
                delete results.flowEvents;
                res.json(results);
            }
        });
    });
});

// Get detailed click statistics
app.get('/api/analytics/clicks', (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const sql = `
        SELECT 
            element_id,
            element_type,
            element_text,
            COUNT(*) as click_count,
            MAX(timestamp) as last_clicked,
            AVG(click_x) as avg_x,
            AVG(click_y) as avg_y
        FROM click_events
        WHERE timestamp > ?
        GROUP BY element_id, element_type, element_text
        ORDER BY click_count DESC
    `;

    db.all(sql, [dateLimit], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching click stats:', err.message);
            res.status(500).json({ error: 'Failed to fetch click statistics' });
        } else {
            res.json(rows);
        }
    });
});

// Export analytics data as CSV
app.get('/api/analytics/export/clicks', (req, res) => {
    const sql = `
        SELECT * FROM click_events
        ORDER BY timestamp DESC
        LIMIT 10000
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Error exporting clicks:', err.message);
            res.status(500).json({ error: 'Failed to export data' });
        } else {
            // Convert to CSV
            if (rows.length === 0) {
                res.send('No data available');
                return;
            }

            const headers = Object.keys(rows[0]).join(',');
            const csvRows = rows.map(row => 
                Object.values(row).map(val => 
                    typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
                ).join(',')
            );

            const csv = [headers, ...csvRows].join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=click_analytics.csv');
            res.send(csv);
        }
    });
});

// Serve analytics dashboard
app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'analytics-dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Analytics server running on http://localhost:${PORT}`);
    console.log(`📊 Analytics dashboard: http://localhost:${PORT}/analytics`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});
