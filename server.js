import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware pentru verificare JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token necesar' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token invalid' });
    req.adminId = decoded.id;
    next();
  });
};

// ==================== AUTENTIFICARE ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credențiale incorecte' });
    }

    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credențiale incorecte' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ token, admin: { id: admin.id, username: admin.username, level: admin.level } });
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Register (doar pentru admini existenți)
app.post('/api/auth/register', verifyToken, async (req, res) => {
  try {
    const { username, password, level } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO admins (username, password_hash, level) VALUES (?, ?, ?)',
      [username, hashedPassword, level || 1]
    );

    res.json({ message: 'Admin creat cu succes' });
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// ==================== JUCĂTORI ====================

// Obține lista jucătorilor
app.get('/api/players', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [players] = await connection.query('SELECT * FROM players');
    res.json(players);
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Obține statistici jucător
app.get('/api/players/:playerId/stats', verifyToken, async (req, res) => {
  try {
    const { playerId } = req.params;
    const connection = await pool.getConnection();
    const [stats] = await connection.query(
      'SELECT * FROM player_stats WHERE player_id = ?',
      [playerId]
    );
    res.json(stats[0] || {});
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Kick jucător
app.post('/api/players/:playerId/kick', verifyToken, async (req, res) => {
  try {
    const { playerId } = req.params;
    const { reason } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO actions_log (admin_id, player_id, action, reason) VALUES (?, ?, ?, ?)',
      [req.adminId, playerId, 'kick', reason || 'Fără motiv']
    );

    res.json({ message: 'Jucătorul a fost dat afară' });
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Ban jucător
app.post('/api/players/:playerId/ban', verifyToken, async (req, res) => {
  try {
    const { playerId } = req.params;
    const { reason, duration } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE players SET banned = 1, ban_reason = ?, ban_until = DATE_ADD(NOW(), INTERVAL ? HOUR) WHERE id = ?',
      [reason || 'Fără motiv', duration || 24, playerId]
    );

    await connection.query(
      'INSERT INTO actions_log (admin_id, player_id, action, reason) VALUES (?, ?, ?, ?)',
      [req.adminId, playerId, 'ban', reason || 'Fără motiv']
    );

    res.json({ message: 'Jucătorul a fost banat' });
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// Mute jucător
app.post('/api/players/:playerId/mute', verifyToken, async (req, res) => {
  try {
    const { playerId } = req.params;
    const { duration, reason } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE players SET muted = 1, mute_until = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?',
      [duration || 30, playerId]
    );

    await connection.query(
      'INSERT INTO actions_log (admin_id, player_id, action, reason) VALUES (?, ?, ?, ?)',
      [req.adminId, playerId, 'mute', reason || 'Spam']
    );

    res.json({ message: 'Jucătorul a fost pus pe mute' });
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// ==================== SERVER ====================

// Obține informații server
app.get('/api/server/info', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [serverInfo] = await connection.query('SELECT * FROM server_info LIMIT 1');
    res.json(serverInfo[0] || {});
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// ==================== COMENZI ====================

// Obține lista comenzilor
app.get('/api/commands', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [commands] = await connection.query('SELECT * FROM commands');
    res.json(commands);
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// ==================== LOG-URI ====================

// Obține log-urile acțiunilor
app.get('/api/logs', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [logs] = await connection.query(
      'SELECT * FROM actions_log ORDER BY created_at DESC LIMIT 100'
    );
    res.json(logs);
    connection.release();
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server este activ' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server admin panel rulează pe http://localhost:${PORT}`);
});
