'use strict';

//express router middleware
const router = require('express').Router();

//instance of canddate router functions
const Candidates = require('./candidate.route');

//entry point for candidate route
router.use('/candidates', Candidates);

router.get('/', (req, res, next) => {
  res.json({ status: 'success', message: 'Sample api is Live' });
});

module.exports = router;
