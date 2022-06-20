'use strict';
const _db = require('../models');
//authticate candidate
const candidateAuth = (req, res, next) => {
  const authToken = req.header('auth-key');
  _db.candidates
    .findByToken(authToken)
    .then((candidate) => {
      if (!candidate) {
        return Promise.reject();
      }
      req.candidate = candidate;
      req.token = authToken;
      next();
    })
    .catch((e) => res.status(401).send());
};

module.exports = {
  candidateAuth,
};
