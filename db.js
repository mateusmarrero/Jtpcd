const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql.us.stackcp.com',
  port: parseInt(process.env.DB_PORT || '47368', 10),
  user: process.env.DB_USER || 'admin-4140',
  password: process.env.DB_PASSWORD || 'ehqGsk-ipioit-ie7zje',
  database: process.env.DB_NAME || 'JTPCD_-3530363305e5',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

module.exports = pool;
