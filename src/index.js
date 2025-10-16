// src/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/features', async (req, res) => {
    try {
        const sql = `SELECT id, name, ST_AsGeoJSON(geom)::json AS geometry FROM features LIMIT 500`;
        const { rows } = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

// bbox sorgusu: ?xmin=...&ymin=...&xmax=...&ymax=...
app.get('/api/features/bbox', async (req, res) => {
    try {
        const { xmin, ymin, xmax, ymax } = req.query;
        const sql = `
      SELECT id, name, ST_AsGeoJSON(geom)::json AS geometry
      FROM features
      WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
    `;
        const { rows } = await db.query(sql, [xmin, ymin, xmax, ymax]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
