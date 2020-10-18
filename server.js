const express = require('express'); // import server

const PORT = process.env.PORT || 3001; //tell application which port to go through
const app = express(); //localized access to express

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// GOES AT THE BOTTOM AS THIS WILL OVERRIDE ALL OTHER ROUTES! Default response for any other request (Not Found) Catch all.
app.use((req, res) => {
    res.status(404).end(); //if response is 404 show default error page (HTTP ERROR 404 page)
})

//Provides feedback to the developer on which port the app is currently connected to
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})