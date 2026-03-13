const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create or connect to the SQLite database file in the backend root
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to SQLite database', err);
  } else {
    console.log('Connected to SQLite database (PostgreSQL Shim)');
    // Enable foreign keys which are off by default in SQLite
    db.run("PRAGMA foreign_keys = ON;");
  }
});

// Create a wrapper that mimics the `pg` Pool API
const pool = {
  // Mock the client return for transactions (used in authController)
  connect: async () => {
    return {
      query: pool.query,
      release: () => {}, // No-op for SQLite
    };
  },
  
  query: (text, params) => {
    return new Promise((resolve, reject) => {
      // 1. Translate PostgreSQL $1, $2, $3 to SQLite ? parameters
      let sqliteText = text;
      if (params && params.length > 0) {
        sqliteText = text.replace(/\$\d+/g, '?');
      }

      // 2. Translate PostgreSQL specific syntaxes
      // SQLite doesn't have ILIKE, we replace it with LIKE (which is case-insensitive by default in SQLite)
      sqliteText = sqliteText.replace(/ILIKE/g, 'LIKE');
      
      const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT');

      if (isSelect) {
        db.all(sqliteText, params || [], function (err, rows) {
          if (err) {
            console.error('SQLite Query Error (SELECT):', sqliteText, err);
            reject(err);
          } else {
            // Mimic pg response format
            resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
          }
        });
      } else {
        db.run(sqliteText, params || [], function (err) {
          if (err) {
            // Check for constraint violations (mimic pg checking)
            if (err.message.includes('UNIQUE constraint failed')) {
               err.code = '23505'; // pg unique_violation code
            }
            console.error('SQLite Query Error (RUN):', sqliteText, err);
            reject(err);
          } else {
            // Mimic pg response format
            resolve({ rows: [], rowCount: this.changes });
          }
        });
      }
    });
  },
  
  on: (event, cb) => {
    if (event === 'connect') {
      setTimeout(cb, 100);
    } else if (event === 'error') {
      db.on('error', cb);
    }
  }
};

module.exports = pool;
