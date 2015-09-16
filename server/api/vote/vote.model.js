'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OptionSchema = new Schema({
  name: String,
  select: {type: Number, default: 0}
});

var VoteSchema = new Schema({
  name: String,
  options: [OptionSchema],
  user: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Vote', VoteSchema);
