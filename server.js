const sqlite3 = require('sqlite3').verbose(); // import SQLite database. Verbose may help the application explain what it's doing as it's running commands.
const express = require('express'); // import server
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001; //tell application which port to go through
const app = express(); //localized access to express

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to the database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Connected to the election database');
});

// Get all candidates
app.get('/api/candidates', (req, res) => { // connect to api endpoint
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id`;
    const params = []; // store paramaters
    db.all(sql, params, (err, rows) => { // call to the database
        if (err) { // if there is an error
            res.status(500).json({ error: err.message }); //500 is a server error (whereas 404 is a user request error), that is then return in json
            return; //ends the application
        }

        res.json({ //if successful, server responds with 'success' and the data requested
            message: 'success',
            data: rows
        });
    });
});

//locate and show one candidate based on primary key
app.get('/api/candidates/:id', (req, res) => { // queries and filters api by id
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id
                WHERE candidates.id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => { //db.get provides one result
        if(err) { 
            res.status(400).json({ error: err.message }); //400 is given as the error is in response to user data
            return; //return to end the function
        }
    
        res.json({
            message: 'success',
            data: row
        });
    });
});

// Delete a candidate
app.delete('/api/candidates/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }
        
        res.json({
            message: 'Successfully deleted',
            changes: this.changes
        });
    });
});

// Create a candidate
app.post('/api/candidates', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
                VALUES (?, ?, ?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    //ES5 function, not arrow function, to use 'this'
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
});

// GOES AT THE BOTTOM AS THIS WILL OVERRIDE ALL OTHER ROUTES! Default response for any other request (Not Found) Catch all.
app.use((req, res) => {
    res.status(404).end(); //if response is 404 show default error page (HTTP ERROR 404 page)
})

//Event handler makes sure the database is running first before connecting ot the server
db.on('open', () => {
    app.listen(PORT, () => { //starts the express server
        console.log(`Server running on port ${PORT}`);
    });
});