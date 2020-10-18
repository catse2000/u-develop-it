const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');

// Get all candidates
router.get('/candidates', (req, res) => { // connect to api endpoint
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
router.get('/candidates/:id', (req, res) => { // queries and filters api by id
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

// Create a candidate
router.post('/candidates', ({ body }, res) => {
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

router.put('/candidates/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `UPDATE candidates SET party_id = ?
                WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];

    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: req.body, 
            changes: this.changes
        });
    });
});

// Delete a candidate
router.delete('/candidates/:id', (req, res) => {
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

module.exports = router;