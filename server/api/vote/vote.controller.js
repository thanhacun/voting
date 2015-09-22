'use strict';

var _ = require('lodash');
var Vote = require('./vote.model');
var User = require('../user/user.model');

// Get list of votes
exports.index = function(req, res) {
  Vote.find({}).populate('user', 'name').exec(function(err, populatedVotes){
    if(err) {return handleError(res, err);}
    return res.status(200).json(populatedVotes);
  });
  /*
  Vote.find({}, function (err, votes) {
    if(err) {return handleError(res, err); }
    return res.status(200).json(votes);
  })
  */
};
//Filter list of votes by user name
exports.filter = function(req, res) {
  User.findOne({name:req.params.name}, function(err, user) {
    Vote.find({user: user._id}).populate('user', 'name').exec(function (err, populatedVotes) {
      if(err) { return handleError(res, err); }
      //console.log(user._id);
      return res.status(200).json(populatedVotes);
    });
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
    Vote.findById(vote._id).populate('user', 'name').exec(function(err, populatedVote){
      if(err) { return handleError(res, err)}
      return res.status(201).json(populatedVote);
    })
  });
};

// Updates an existing vote in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  //populate with user data
  Vote.findById(req.params.id).populate('user', 'name').exec(function (err, populatedVote) {
    if (err) { return handleError(res, err); }
    if(!populatedVote) { return res.status(404).send('Not Found'); }
    var updated = _.extend(populatedVote, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(populatedVote);
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
