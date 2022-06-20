const config = require('./config/config');
require('./db/mongoose');

const express = require('express');
const cors = require('cors');

const app = express();

// Use cors
app.use(cors());

// Use the body-parser package in our application
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Route
const api = require('./routes');
app.use('/', api);

let PORT = config.port;
app.listen(PORT, () => {
  console.log(`APi is available at port ${PORT}.`);
});
