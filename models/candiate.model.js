'use strict';
const mongoose = require('mongoose');
const _ = require('lodash');
const validator = require('validator');

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

let Candidates = mongoose.model('candidates', candidateSchema);

module.exports = Candidates;
