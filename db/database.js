const sqlite3 = require('sqlite3').verbose(); // import SQLite database. Verbose may help the application explain what it's doing as it's running commands.

// Connect to the database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Connected to the election database');
});

module.exports = db;