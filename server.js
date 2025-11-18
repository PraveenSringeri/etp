const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// WebSocket for live room
const liveConnections = new Set();

wss.on('connection', (ws) => {
    liveConnections.add(ws);
    console.log('New client connected to live room');

    // Send welcome message
    ws.send(JSON.stringify({
        name: 'System',
        text: 'Welcome to the Live Room! You are now connected.'
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            // Broadcast to all connected clients
            liveConnections.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        liveConnections.delete(ws);
        console.log('Client disconnected from live room');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        liveConnections.delete(ws);
    });
});

// Initialize SQLite Database
const db = new sqlite3.Database('./prowellbeing.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        
        // Create tables if they don't exist
        db.run(`CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT,
            score INTEGER,
            total INTEGER,
            quiz_type TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS wellbeing_checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT,
            mood TEXT,
            stress_level INTEGER,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT,
            session_type TEXT,
            duration_minutes INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('Database tables initialized');
    }
});

// API Routes

// Save quiz results
app.post('/api/quiz-results', (req, res) => {
    const { studentName, score, total, quizType } = req.body;
    
    if (!studentName || score === undefined || total === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.run(
        `INSERT INTO quiz_results (student_name, score, total, quiz_type) VALUES (?, ?, ?, ?)`,
        [studentName, score, total, quizType || 'general'],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                message: 'Quiz result saved successfully', 
                id: this.lastID 
            });
        }
    );
});

// Save wellbeing check
app.post('/api/wellbeing-check', (req, res) => {
    const { studentName, mood, stressLevel, message } = req.body;
    
    if (!studentName || !mood || stressLevel === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.run(
        `INSERT INTO wellbeing_checks (student_name, mood, stress_level, message) VALUES (?, ?, ?, ?)`,
        [studentName, mood, stressLevel, message || ''],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                message: 'Wellbeing check saved successfully', 
                id: this.lastID 
            });
        }
    );
});

// Save study session
app.post('/api/study-sessions', (req, res) => {
    const { studentName, sessionType, durationMinutes } = req.body;
    
    if (!studentName || !sessionType || durationMinutes === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.run(
        `INSERT INTO study_sessions (student_name, session_type, duration_minutes) VALUES (?, ?, ?)`,
        [studentName, sessionType, durationMinutes],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                message: 'Study session saved successfully', 
                id: this.lastID 
            });
        }
    );
});

// Get all quiz results
app.get('/api/quiz-results', (req, res) => {
    db.all(`SELECT * FROM quiz_results ORDER BY timestamp DESC`, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

// Get wellbeing checks for a student
app.get('/api/wellbeing-checks/:studentName', (req, res) => {
    const studentName = req.params.studentName;
    
    db.all(
        `SELECT * FROM wellbeing_checks WHERE student_name = ? ORDER BY timestamp DESC`,
        [studentName],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        }
    );
});

// Get study sessions for a student
app.get('/api/study-sessions/:studentName', (req, res) => {
    const studentName = req.params.studentName;
    
    db.all(
        `SELECT * FROM study_sessions WHERE student_name = ? ORDER BY timestamp DESC`,
        [studentName],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        }
    );
});

// Get dashboard stats
app.get('/api/dashboard-stats', (req, res) => {
    const stats = {};
    
    // Get total quiz attempts
    db.get(`SELECT COUNT(*) as total_quizzes FROM quiz_results`, (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        stats.totalQuizzes = row ? row.total_quizzes : 0;
        
        // Get average stress level
        db.get(`SELECT AVG(stress_level) as avg_stress FROM wellbeing_checks`, (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            stats.averageStress = row && row.avg_stress ? Math.round(row.avg_stress * 10) / 10 : 0;
            
            // Get total study minutes
            db.get(`SELECT SUM(duration_minutes) as total_study FROM study_sessions`, (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: err.message });
                }
                stats.totalStudyMinutes = row ? row.total_study : 0;
                
                // Get total wellbeing checks
                db.get(`SELECT COUNT(*) as total_checks FROM wellbeing_checks`, (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    stats.totalWellbeingChecks = row ? row.total_checks : 0;
                    
                    res.json(stats);
                });
            });
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        liveConnections: liveConnections.size
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'etp.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 ProWellbeing Server running on http://localhost:${PORT}`);
    console.log(`📊 SQLite database: prowellbeing.db`);
    console.log(`💬 Live room WebSocket server running on ws://localhost:${PORT}`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});