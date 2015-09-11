'use strict';

angular.module('votingApp')
  .controller('VotingCtrl', function ($scope, $http, socket) {
    $scope.polls = [];

    $http.get('/api/votes').success(function(polls){
      $scope.polls = polls;
      socket.syncUpdates('vote', $scope.polls);
    });

    $scope.addPoll = function(){
      if ($scope.newPoll.name === '' || $scope.newPoll.options.length === 0) {
        return;
      }
      //create options
      var raw_options = $scope.newPoll.options;
      var options = [];
      for (var i = 0; i ++; i < raw_options.length) {
        options.push({
          name: raw_options[i]
        })
      }
      console.log($scope.newPoll);
      console.log(raw_options);
      $http.post('/api/votes', {
        name: $scope.newPoll.name,
        options: options

      });
      $scope.newPoll = '';
    };

    $scope.deletePoll = function(poll){
      $http.delete('/api/votes/'+ poll._id);
    };

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('vote');
    })
  });
