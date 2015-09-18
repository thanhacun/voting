'use strict';

angular.module('votingApp')
  .controller('VotingCtrl', function ($scope, $http, $routeParams, socket, Auth, User) {
    $scope.polls = [];
    $scope.data = {};
    $scope.currentUser = Auth.getCurrentUser();
    $scope.isLoggedInAsync = Auth.isLoggedInAsync
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
        //generate data to use with Chart.js
        angular.forEach(polls, function(poll, key){
          $scope.data[poll._id] = {};
          //create label for data set from options name
          $scope.data[poll._id].labels = poll.options.map(function(option){
            return option.name;
          });
          //create data set
          $scope.data[poll._id].datasets =[{
            fillColor: "#48A497",
            strokeColor: "#48A4D1",
            data: poll.options.map(function(option){
              return option.select;
            })
          }];
        });
        console.log(JSON.stringify($scope.data));

      }
    });

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
      $http.put('/api/votes/' + poll._id, poll).success(function(poll){
        $scope.showChart(poll);
      });
      console.log(JSON.stringify(poll));
    }

    $scope.showChart = function(poll) {
      console.log(poll._id);
      console.log($scope.data[poll._id]);
      var testChart = document.getElementById(poll._id).getContext('2d');
      new Chart(testChart).Bar($scope.data[poll._id]);
    }
  });
