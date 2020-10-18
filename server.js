const express = require('express'); // import server
const db = require('./db/database'); //imports database.js

const PORT = process.env.PORT || 3001; //tell application which port to go through
const app = express(); //localized access to express

const apiRoutes = require('./routes/apiRoutes'); //imports index.js file automatically

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use apiRoutes
app.use('/api', apiRoutes); 


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