'use strict';

angular.module('votingApp')
  .controller('VotingCtrl', function ($scope, $http, $routeParams, socket, Auth, User) {
    //TODO: function to generate poll data
    $scope.polls = [];
    $scope.data = {};
    $scope.currentUser = Auth.getCurrentUser();
    $scope.isLoggedInAsync = Auth.isLoggedInAsync
    var login_name = $scope.currentUser.name;
    var login_id = $scope.currentUser._id
    var input_name = $routeParams.name;

    $scope.options = ['Coca', 'Pepsi'];
    $scope.vote = {};
    $scope.showChart = false;

    $scope.addOption = function() {
      $scope.options.push('Option');
      console.log('Add options');
    }

    $scope.getPollData = function(poll) {
      //$scope.data[poll._id] = {};
      var result = {};
      //create label for data set from options name
      result.labels = poll.options.map(function(option){
        return option.name;
      });
      //create data set
      result.datasets =[{
        fillColor: "#48A497",
        strokeColor: "#48A4D1",
        data: poll.options.map(function(option){
          return option.select;
        })
      }];
      return result;
    }

    $http.get('/api/votes/' + input_name).success(function(polls){
      //login user can see only his/her votes
      if (input_name === login_name) {
        $scope.polls = polls;
        socket.syncUpdates('vote', $scope.polls);
        //generate data to use with Chart.js
        angular.forEach(polls, function(poll, key){
          $scope.data[poll._id] = $scope.getPollData(poll);
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
        $scope.data[newPoll._id] = $scope.getPollData(newPoll);
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
      //console.log('User select', option_id, 'for', poll.name);
      //TODO it is hard to update subdocument partly, temporary update the whole object
      //$scope.showChart(poll);

      $http.put('/api/votes/' + poll._id, poll).then(function(response){
        console.log(JSON.stringify(response.data));
        //$scope.showChart(response.data);
        $scope.showChart = true;
      });

      //console.log(JSON.stringify(poll));
    }

    $scope.showChart = function(poll) {
      //console.log(poll._id);
      //console.log($scope.data[poll._id]);
      var testChart = document.getElementById(poll._id).getContext('2d');
      new Chart(testChart).Bar($scope.data[poll._id]);
    }
  })
  .controller('ChartCtrl', function($scope) {
    console.log('Showing Chart')
    //var testChart = document.getElementById()
  });
