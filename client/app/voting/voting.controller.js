'use strict';

angular.module('votingApp')
  .controller('VotingCtrl', function ($scope, $http, $routeParams, socket, Auth, User) {
    $scope.polls = [];
    $scope.currentUser = Auth.getCurrentUser();
    var login_name = $scope.currentUser.name;
    var login_id = $scope.currentUser._id
    var input_name = $routeParams.name;

    $scope.options = ['Coca', 'Pepsi'];
    $scope.vote = {};

    $scope.addOption = function() {
      $scope.options.push('Option');
      console.log('Add options');
    }

    $http.get('/api/votes/' + input_name).success(function(polls){
      //login user can see only his/her votes
      if (input_name === login_name) {
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
      var newPoll = {
        name: $scope.newPoll.name,
        options: options,
        user: login_id
      }
      $scope.polls.push(newPoll);

      $http.post('/api/votes', newPoll).success(function(newPoll){
        //update $scope.polls to get _id
        $scope.polls.pop();
        $scope.polls.push(newPoll);
        $scope.newPoll = '';
      });
    };

    $scope.deletePoll = function(poll){
      $http.delete('/api/votes/'+ poll._id);
    };

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('vote');
    });

    $scope.doPoll = function(poll){
      var option_id = $scope.vote.select;
      //increase 1 to the selected option
      poll.options.map(function(option) {
        if (option._id === option_id) {
          option.select ++;
        }
      });
      console.log('User select', option_id, 'for', poll.name);
      //TODO it is hard to update subdocument partly, temporary update the whole object
      $http.put('/api/votes/' + poll._id, poll);
      console.log(JSON.stringify(poll));
    }
  });
