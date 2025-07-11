// server.js
const express = require('express');
//const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); // <-- ADD THIS LINE

// (rest of your server.js, including Mongoose connection, Movie schema/model, and your API routes)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});