'use strict';

var _ = require('lodash');
var Vote = require('./vote.model');

// Get list of votes
exports.index = function(req, res) {
  Vote.find(function (err, votes) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(votes);
  });
};

// Get a single vote
exports.show = function(req, res) {
  Vote.findById(req.params.id, function (err, vote) {
    if(err) { return handleError(res, err); }
    if(!vote) { return res.status(404).send('Not Found'); }
    return res.json(vote);
  });
};

// Creates a new vote in the DB.
exports.create = function(req, res) {
  Vote.create(req.body, function(err, vote) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(vote);
  });
};

// Updates an existing vote in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Vote.findById(req.params.id, function (err, vote) {
    if (err) { return handleError(res, err); }
    if(!vote) { return res.status(404).send('Not Found'); }
    var updated = _.merge(vote, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(vote);
    });
  });
};

// Deletes a vote from the DB.
exports.destroy = function(req, res) {
  Vote.findById(req.params.id, function (err, vote) {
    if(err) { return handleError(res, err); }
    if(!vote) { return res.status(404).send('Not Found'); }
    vote.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}