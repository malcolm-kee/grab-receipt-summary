const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  total: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  pickup: {
    type: String,
    required: true
  },
  dropoff: {
    type: String,
    required: true
  },
  processedOn: {
    type: String,
    required: true
  }
});

const Record = mongoose.model('record', recordSchema, 'records');

module.exports = {
  Record
};
