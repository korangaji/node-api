'use strict';
const mongoose = require('mongoose');
const _ = require('lodash');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  countryDialCode: {
    type: String,
    trim: true,
    default: '+91',
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    require: true,
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  pin: {
    type: String,
    default: null,
  },
  gitprofile: {
    type: String,
    default: null,
  },
  createdOn: {
    type: Number,
    default: null,
  },
  updatedOn: {
    type: Number,
    default: null,
  },
});

candidateSchema.methods.toJSON = function () {
  var candidate = this;
  var candidateObj = candidate.toObject();
  return _.omit(candidateObj, ['__v']);
};

candidateSchema.methods.generateAuthToken = function (role) {
  var candidate = this;
  const access = role;
  const privateKey = process.env.TOKEN_SECRET;

  var token = jwt
    .sign({ _id: candidate._id.toHexString(), access }, privateKey, {
      expiresIn: '30d', //currently set to 30 days
    })
    .toString();
  if (candidate.firstLogin === null) {
    candidate.firstLogin = new Date().getTime();
  }
  candidate.recentLogin = new Date().getTime();
  candidate.tokens.push({ access, token });

  return candidate.save().then(() => {
    return token;
  });
};

candidateSchema.methods.removeToken = function (token) {
  var candidate = this;
  return candidate.updateOne({
    $pull: {
      tokens: { token },
    },
  });
};

candidateSchema.methods.removeAllTokens = function () {
  var candidate = this;

  return candidate.updateOne({
    $set: {
      tokens: [],
    },
  });
};

candidateSchema.statics.findByToken = function (token) {
  let candidate = this;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (e) {
    return Promise.reject();
  }
  return candidate.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': decoded.access,
  });
};

candidateSchema.statics.findByCredentials = function (countryDialCode, mobile, email, password) {
  let candidate = this;
  return candidate
    .findOne(
      email && email.length > 0
        ? { email, active: true, deleted: false }
        : { countryDialCode, mobile, active: true, deleted: false },
    )
    .then((candidate) => {
      if (!candidate) return Promise.reject({ notFound: true });

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, candidate.password, (err, res) => {
          if (res) {
            resolve(candidate);
          } else {
            reject({
              wrongPassword: true,
              message: 'Entered login password is incorrect!',
            });
          }
        });
      });
    });
};

// pre-update hook to salt-hash the password before storing
candidateSchema.pre('save', function (next) {
  var candidate = this;
  if (candidate.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(candidate.password, salt, (err, hash) => {
        candidate.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

let Candidates = mongoose.model('candidates', candidateSchema);

module.exports = Candidates;
