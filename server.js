// Analytics Backend Server
// Handles click tracking and analytics database

// Load environment variables from .env file (for local development)
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    require('dotenv').config();
}

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// No blanket CORS: the site and its API share an origin. (/api/contact sets its own, narrower, CORS headers.)
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});
app.use(express.json({ limit: '1mb' }));
// Static serving. Only public assets are exposed -- never the repo root, which contains
// server.js, the SQLite databases and (locally) .env. Paths are literals so Vercel's file
// tracer bundles them with this function.
app.get('/BPC-157_interactive_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'BPC-157_interactive_dashboard.html'));
});
app.get('/google9e5a33f1c42669c8.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'google9e5a33f1c42669c8.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Pinned third-party libraries and the 3D model rarely change; everything else revalidates on each load
app.use('/js/vendor', express.static(path.join(__dirname, 'js', 'vendor'), { dotfiles: 'deny', maxAge: '30d', immutable: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets'), { dotfiles: 'deny', maxAge: '1d' }));
app.use('/css', express.static(path.join(__dirname, 'css'), { dotfiles: 'deny' }));
app.use('/js', express.static(path.join(__dirname, 'js'), { dotfiles: 'deny' }));
app.use('/images', express.static(path.join(__dirname, 'images'), { dotfiles: 'deny' }));
app.use('/pages', express.static(path.join(__dirname, 'pages'), { dotfiles: 'deny' }));

// Serve main SPA / landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize SQLite databases
const db = new sqlite3.Database('./analytics.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

const studiesDb = new sqlite3.Database('./studies.db', (err) => {
    if (err) {
        console.error('❌ Error opening studies database:', err.message);
    } else {
        console.log('✅ Connected to studies database');
        initializeStudiesDatabase();
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

// Initialize studies database tables
function initializeStudiesDatabase() {
    studiesDb.run(`
        CREATE TABLE IF NOT EXISTS studies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT UNIQUE NOT NULL,
            title TEXT,
            doi TEXT,
            pmid TEXT,
            first_seen DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating studies table:', err.message);
        } else {
            console.log('✅ studies table ready');
        }
    });

    studiesDb.run(`
        CREATE TABLE IF NOT EXISTS study_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT NOT NULL,
            vote INTEGER NOT NULL,
            ip_address TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (study_id) REFERENCES studies(study_id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating study_votes table:', err.message);
        } else {
            console.log('✅ study_votes table ready');
        }
    });

    studiesDb.run(`
        CREATE TABLE IF NOT EXISTS study_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_id TEXT NOT NULL,
            comment_text TEXT NOT NULL,
            ip_address TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (study_id) REFERENCES studies(study_id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating study_comments table:', err.message);
        } else {
            console.log('✅ study_comments table ready');
            
            // Create indexes after tables are created
            studiesDb.run(`CREATE INDEX IF NOT EXISTS idx_study_votes_study_id ON study_votes(study_id)`, (err) => {
                if (err) {
                    console.error('❌ Error creating study_votes index:', err.message);
                } else {
                    console.log('✅ study_votes index ready');
                }
            });
            
            studiesDb.run(`CREATE INDEX IF NOT EXISTS idx_study_comments_study_id ON study_comments(study_id)`, (err) => {
                if (err) {
                    console.error('❌ Error creating study_comments index:', err.message);
                } else {
                    console.log('✅ study_comments index ready');
                }
            });
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
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 3650);
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
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 3650);
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

// Crawler files
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'sitemap.xml'));
});
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// Contact form endpoint: same handler Vercel runs for /api/contact
app.all('/api/contact', require('./api/contact'));

// Study Interactions API Endpoints
app.get('/api/study-interactions/:studyId', (req, res) => {
    const { studyId } = req.params;
    
    const votesQuery = `
        SELECT 
            SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END) as upvotes,
            SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END) as downvotes
        FROM study_votes
        WHERE study_id = ?
    `;
    
    const commentsQuery = `
        SELECT id, comment_text, timestamp as created_at
        FROM study_comments
        WHERE study_id = ?
        ORDER BY timestamp DESC
    `;
    
    studiesDb.get(votesQuery, [studyId], (err, votes) => {
        if (err) {
            console.error('Error fetching votes:', err);
            return res.status(500).json({ error: 'Failed to fetch votes' });
        }
        
        studiesDb.all(commentsQuery, [studyId], (err, comments) => {
            if (err) {
                console.error('Error fetching comments:', err);
                return res.status(500).json({ error: 'Failed to fetch comments' });
            }
            
            res.json({
                upvotes: votes?.upvotes || 0,
                downvotes: votes?.downvotes || 0,
                comments: comments || []
            });
        });
    });
});

app.post('/api/study-vote', (req, res) => {
    const { study_id, vote, title, doi, pmid } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    if (!study_id || typeof study_id !== 'string' || study_id.length > 200 || (vote !== 1 && vote !== -1)) {
        return res.status(400).json({ error: 'Invalid vote data' });
    }
    
    // First, ensure study exists
    studiesDb.run(
        `INSERT OR IGNORE INTO studies (study_id, title, doi, pmid) VALUES (?, ?, ?, ?)`,
        [study_id, title, doi, pmid],
        (err) => {
            if (err) {
                console.error('Error inserting study:', err);
                return res.status(500).json({ error: 'Failed to record study' });
            }
            
            // Then add vote
            studiesDb.run(
                `INSERT INTO study_votes (study_id, vote, ip_address) VALUES (?, ?, ?)`,
                [study_id, vote, ipAddress],
                (err) => {
                    if (err) {
                        console.error('Error inserting vote:', err);
                        return res.status(500).json({ error: 'Failed to record vote' });
                    }
                    
                    res.json({ success: true });
                }
            );
        }
    );
});

app.post('/api/study-interactions-bulk', (req, res) => {
    const { study_ids } = req.body;
    
    // SQLite caps bound variables (999 by default), so keep the batch well below that.
    if (!Array.isArray(study_ids) || study_ids.length === 0 || study_ids.length > 500 ||
        study_ids.some((id) => typeof id !== 'string' && typeof id !== 'number')) {
        return res.status(400).json({ error: 'Invalid study IDs' });
    }
    
    const placeholders = study_ids.map(() => '?').join(',');
    
    const votesQuery = `
        SELECT 
            study_id,
            SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END) as upvotes,
            SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END) as downvotes
        FROM study_votes
        WHERE study_id IN (${placeholders})
        GROUP BY study_id
    `;
    
    const commentsQuery = `
        SELECT 
            study_id,
            COUNT(*) as comment_count
        FROM study_comments
        WHERE study_id IN (${placeholders})
        GROUP BY study_id
    `;
    
    studiesDb.all(votesQuery, study_ids, (err, votes) => {
        if (err) {
            console.error('Error fetching bulk votes:', err);
            return res.status(500).json({ error: 'Failed to fetch votes' });
        }
        
        studiesDb.all(commentsQuery, study_ids, (err, comments) => {
            if (err) {
                console.error('Error fetching bulk comments:', err);
                return res.status(500).json({ error: 'Failed to fetch comments' });
            }
            
            const votesMap = {};
            votes.forEach(v => {
                votesMap[v.study_id] = {
                    upvotes: v.upvotes || 0,
                    downvotes: v.downvotes || 0
                };
            });
            
            const commentsMap = {};
            comments.forEach(c => {
                commentsMap[c.study_id] = c.comment_count || 0;
            });
            
            const results = {};
            study_ids.forEach(id => {
                results[id] = {
                    upvotes: votesMap[id]?.upvotes || 0,
                    downvotes: votesMap[id]?.downvotes || 0,
                    comments: commentsMap[id] || 0
                };
            });
            
            res.json(results);
        });
    });
});

app.post('/api/study-comment', (req, res) => {
    const { study_id, comment_text, title, doi, pmid } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    if (!study_id || typeof study_id !== 'string' || study_id.length > 200 ||
        typeof comment_text !== 'string' || comment_text.trim().length === 0 || comment_text.length > 1000) {
        return res.status(400).json({ error: 'Invalid comment data' });
    }
    
    // Ensure study exists
    studiesDb.run(
        `INSERT OR IGNORE INTO studies (study_id, title, doi, pmid) VALUES (?, ?, ?, ?)`,
        [study_id, title, doi, pmid],
        (err) => {
            if (err) {
                console.error('Error inserting study:', err);
                return res.status(500).json({ error: 'Failed to record study' });
            }
            
            // Then add comment
            studiesDb.run(
                `INSERT INTO study_comments (study_id, comment_text, ip_address) VALUES (?, ?, ?)`,
                [study_id, comment_text.trim(), ipAddress],
                (err) => {
                    if (err) {
                        console.error('Error inserting comment:', err);
                        return res.status(500).json({ error: 'Failed to record comment' });
                    }
                    
                    res.json({ success: true });
                }
            );
        }
    );
});

// Research cache endpoints for popular searches
const researchCacheDb = new sqlite3.Database('./research_cache.db', (err) => {
    if (err) {
        console.error('❌ Error opening research cache database:', err.message);
    } else {
        console.log('✅ Connected to research cache database');
        initializeResearchCacheDatabase();
    }
});

function initializeResearchCacheDatabase() {
    researchCacheDb.run(`
        CREATE TABLE IF NOT EXISTS research_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cache_key TEXT UNIQUE NOT NULL,
            query_text TEXT,
            results_data TEXT NOT NULL,
            search_count INTEGER DEFAULT 1,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating research_cache table:', err.message);
        } else {
            console.log('✅ research_cache table ready');
            
            researchCacheDb.run(`CREATE INDEX IF NOT EXISTS idx_cache_key ON research_cache(cache_key)`, (err) => {
                if (err) {
                    console.error('❌ Error creating cache_key index:', err.message);
                } else {
                    console.log('✅ cache_key index ready');
                }
            });
        }
    });
}

// Get popular research queries
app.get('/api/research-cache/popular', (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    
    researchCacheDb.all(
        `SELECT query_text, search_count, last_updated 
         FROM research_cache 
         WHERE query_text IS NOT NULL
         ORDER BY search_count DESC 
         LIMIT ?`,
        [limit],
        (err, rows) => {
            if (err) {
                console.error('Error fetching popular queries:', err);
                return res.status(500).json({ error: 'Failed to fetch popular queries' });
            }
            
            res.json({ queries: rows });
        }
    );
});

// Get cached research results
app.get('/api/research-cache/:cacheKey', (req, res) => {
    const { cacheKey } = req.params;
    
    researchCacheDb.get(
        `SELECT results_data, last_updated, search_count FROM research_cache WHERE cache_key = ?`,
        [cacheKey],
        (err, row) => {
            if (err) {
                console.error('Error fetching research cache:', err);
                return res.status(500).json({ error: 'Failed to fetch cache' });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Cache not found' });
            }
            
            // Increment search count
            researchCacheDb.run(
                `UPDATE research_cache SET search_count = search_count + 1 WHERE cache_key = ?`,
                [cacheKey],
                (err) => {
                    if (err) console.error('Error updating search count:', err);
                }
            );
            
            res.json({
                results: JSON.parse(row.results_data),
                timestamp: new Date(row.last_updated).getTime(),
                searchCount: row.search_count + 1
            });
        }
    );
});

// Store research results in server cache
app.post('/api/research-cache', (req, res) => {
    const { cacheKey, queryText, results } = req.body;
    
    if (!cacheKey || !results) {
        return res.status(400).json({ error: 'Invalid cache data' });
    }
    
    const resultsJson = JSON.stringify(results);
    
    researchCacheDb.run(
        `INSERT INTO research_cache (cache_key, query_text, results_data, last_updated)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(cache_key) DO UPDATE SET
            results_data = excluded.results_data,
            last_updated = CURRENT_TIMESTAMP,
            search_count = search_count + 1`,
        [cacheKey, queryText, resultsJson],
        (err) => {
            if (err) {
                console.error('Error storing research cache:', err);
                return res.status(500).json({ error: 'Failed to store cache' });
            }
            
            res.json({ success: true });
        }
    );
});

// Export for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`🚀 Analytics server running on http://localhost:${PORT}`);
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing analytics database:', err.message);
        } else {
            console.log('✅ Analytics database connection closed');
        }
        
        studiesDb.close((err) => {
            if (err) {
                console.error('❌ Error closing studies database:', err.message);
            } else {
                console.log('✅ Studies database connection closed');
            }
            
            researchCacheDb.close((err) => {
                if (err) {
                    console.error('❌ Error closing research cache database:', err.message);
                } else {
                    console.log('✅ Research cache database connection closed');
                }
                process.exit(0);
            });
        });
    });
});
