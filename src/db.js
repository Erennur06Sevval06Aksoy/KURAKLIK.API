// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Eğer SSL gerekiyorsa (prod) burada yapılandır:
    // ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
    console.error('Unexpected PG error', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
