/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Vote = require('./vote.model');

exports.register = function(socket) {
  Vote.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Vote.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('vote:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('vote:remove', doc);
}