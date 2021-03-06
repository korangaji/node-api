'use strict';
const router = require('express').Router();
const _ = require('lodash');
const _db = require('../models');
const _lib = require('../lib');

//add new candidate
router.post('/add', (req, res, next) => {
  let body = _.pick(req.body, [
    'name',
    'dob',
    'countryDialCode',
    'phone',
    'email',
    'password',
    'address',
    'city',
    'country',
    'pin',
    'gitprofile',
  ]);
  if (!body.password) {
    return res.json({
      status: 'error',
      message: 'Password is required',
    });
  }
  if (!body.name && !body.email) {
    return res.json({
      status: 'error',
      message: 'Provide candidate name and email',
    });
  }
  body.createdOn = new Date().getTime();
  _db.candidates
    .findOne({ email: body.email })
    .then((exists) => {
      if (exists) {
        res.json({
          status: 'error',
          message: 'Candidate with given email is already registered',
        });
      } else {
        let candidate = new _db.candidates(body);
        candidate
          .save()
          .then((profile) => {
            res.json({
              status: 'success',
              candidate: profile,
            });
          })
          .catch((e) => {
            res.json({
              status: 'error',
              message: e.message,
            });
          });
      }
    })
    .catch((e) => {
      res.json({
        status: 'error',
        message: e.message,
      });
    });
});

//update candidate profile
router.put('/update/:candidateId', _lib.Auth.candidateAuth, (req, res, next) => {
  let candidateId = req.params.candidateId;
  if (candidateId === 'undefined' || candidateId === null) {
    res.json({
      status: 'error',
      message: 'Candidate Id is missing',
    });
  }
  let body = _.pick(req.body, [
    'name',
    'dob',
    'countryDialCode',
    'phone',
    'address',
    'city',
    'country',
    'pin',
    'gitprofile',
  ]);
  body.updatedOn = new Date().getTime();
  _db.candidates
    .findById(candidateId)
    .then((exists) => {
      if (exists) {
        _db.candidates
          .findByIdAndUpdate(exists._id, body, { new: true })
          .then((candidate) => {
            res.json({
              status: 'success',
              message: 'Candidate profile updated successfully!',
              candidate: candidate,
            });
          })
          .catch((e) => {
            res.json({
              status: 'error',
              message: e.message,
            });
          });
      } else {
        res.json({
          status: 'error',
          message: 'Candidate Id not found for update',
        });
      }
    })
    .catch((e) => {
      res.json({
        status: 'error',
        message: e.message,
      });
    });
});

//get all candidates
router.get('/get/all', (req, res, next) => {
  _db.candidates
    .find()
    .then((candidates) => {
      if (candidates.length > 0) {
        res.json({
          status: 'success',
          candidates: candidates,
        });
      } else {
        res.json({
          status: 'error',
          message: 'No candidates found',
        });
      }
    })
    .catch((e) => {
      res.json({
        status: 'error',
        message: e.message,
      });
    });
});

//get candidate by Id
router.get('/get/:candidateId', _lib.Auth.candidateAuth, (req, res, next) => {
  let candidateId = req.params.candidateId;
  if (candidateId === 'undefined' || candidateId === null) {
    res.json({
      status: 'error',
      message: 'Candidate Id is missing',
    });
  }
  _db.candidates
    .findOne({ _id: candidateId })
    .then((candidate) => {
      if (!candidate) {
        res.json({
          status: 'error',
          message: 'Candidarte with given id not found',
        });
      } else {
        res.json({
          status: 'success',
          candidate: candidate,
        });
      }
    })
    .catch((e) => {
      res.json({
        status: 'error',
        message: e.message,
      });
    });
});

//delete candidate by id
router.delete('/delete/:candidateId', _lib.Auth.candidateAuth, (req, res, next) => {
  let candidateId = req.params.candidateId;
  if (candidateId === 'undefined' || candidateId === null) {
    res.json({
      status: 'error',
      message: 'Candidate Id is missing',
    });
  }
  _db.candidates
    .deleteOne({ _id: candidateId })
    .then((result) => {
      res.json(result);
    })
    .catch((e) => {
      res.json({
        status: 'error',
        message: e.message,
      });
    });
});

//candidate login api
router.post('/login', (req, res, next) => {
  let body = _.pick(req.body, ['email', 'password']);
  _db.candidates
    .findByCredentials(body.email, body.password)
    .then((candidate) => {
      return candidate.generateAuthToken().then((token) => {
        res.header('auth-key', token).json({ ...candidate, token });
      });
    })
    .catch((e) => {
      if (e.notFound) {
        res.json({ status: 'error', message: 'Candidate not found!' });
      } else {
        res.status(400).send(e);
      }
    });
});

//candidate password change
router.post('/change-password', _lib.Auth.candidateAuth, (req, res) => {
  let body = _.pick(req.body, ['userId', 'password']);
  if (!body.userId && !body.password) return res.status(400).send();
  _db.candidates
    .findById(body.userId)
    .then((candidate) => {
      if (!candidate) {
        return res.json({
          status: 'error',
          message: 'Invalid user id!',
        });
      }
      candidate.password = body.password;
      candidate
        .save()
        .then(() => candidate.removeAllTokens())
        .then(() =>
          res.json({
            status: 'success',
            message: 'Password changed successfully.',
          }),
        )
        .catch((e) => res.status(500).send(e));
    })
    .catch((e) => res.status(400).send(e));
});

//candidate logout
router.post('/logout', _lib.Auth.candidateAuth, (req, res) => {
  let candidate = req.candidate;
  candidate
    .removeToken(req.token)
    .then(() => {
      res.json({
        status: 'success',
        message: 'User Logged Out successfully.',
      });
    })
    .catch((err) => res.status(500).send(err));
});

module.exports = router;
