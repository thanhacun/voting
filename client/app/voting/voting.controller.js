'use strict';

angular.module('votingApp')
  .controller('VotingCtrl', function ($scope, $http, $routeParams, socket, Auth, User) {
    $scope.polls = [];
    var email = $routeParams.email;

    $http.get('/api/votes/' + email).success(function(polls){
      $scope.polls = polls;
      socket.syncUpdates('vote', $scope.polls);
    });

    $scope.addPoll = function(){
      //check having poll name or any Option
      if ($scope.newPoll.name === '' || typeof($scope.newPoll.options) === 'undefined') {
        return;
      }
      //convert input options as a object into array to match with data schema
      var raw_options = $scope.newPoll.options;
      var options = [];
      $.each(raw_options, function(key, option) {
        options.push({name: option});
      });

      $http.post('/api/votes', {
        name: $scope.newPoll.name,
        options: options
        //TODO add user _id here
      }).success(function(newPoll){
        //update $scope.polls to get _id
        console.log(newPoll);
        $scope.polls.pop();
        $scope.polls.push(newPoll);
        $scope.newPoll = '';
        console.log($scope.polls)
      });
    };

    $scope.deletePoll = function(poll){
      $http.delete('/api/votes/'+ poll._id);
    };

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('vote');
    })
  });
