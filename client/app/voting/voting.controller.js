'use strict';

angular.module('votingApp')
  .controller('VotingCtrl', function ($scope, $http, $routeParams, socket, Auth, User) {
    $scope.polls = [];
    $scope.currentUser = Auth.getCurrentUser();
    var login_name = $scope.currentUser.name;
    var login_id = $scope.currentUser._id
    var inputed_name = $routeParams.name;

    $http.get('/api/votes/' + inputed_name).success(function(polls){
      //login user can see only his/her votes
      if (inputed_name === login_name) {
        $scope.polls = polls;
        socket.syncUpdates('vote', $scope.polls);
      }
    })  ;

    $scope.addPoll = function(){
      //check having poll name or any Option
      if ($scope.newPoll.name === '' || typeof($scope.newPoll.options) === 'undefined') {
        return;
      }
      //convert input options as a object into array to match with data schema
      var raw_options = $scope.newPoll.options;
      var options = [];
      angular.forEach(raw_options, function(option, key) {
        options.push({name: option});
      });

      $http.post('/api/votes', {
        name: $scope.newPoll.name,
        options: options,
        user: login_id
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
    });

    $scope.doPoll = function(poll){
      console.log('Update poll options select');
      console.log($scope);
      console.log(poll);
      //update user select to poll options
    }
  });
