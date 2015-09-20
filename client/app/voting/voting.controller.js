'use strict';

angular.module('votingApp')
  .controller('VotingCtrl', function ($scope, $http, $routeParams, socket, Auth, User) {
    $scope.polls = [];
    $scope.initSamplePoll = function() {
      $scope.samplePoll = {
        name: 'Which drink do you prefer?',
        options: [
          {name: 'Coca'},
          {name: 'Pepsi'}
        ]
      };
      $scope.newPoll = {};
    };
    $scope.initSamplePoll();
    $scope.data = {};
    $scope.currentUser = Auth.getCurrentUser();
    Auth.isLoggedInAsync(function(bool){
      if (bool) {
        $scope.isLoggedIn = true;
      }
    });
    var login_name = $scope.currentUser.name;
    var login_id = $scope.currentUser._id
    var input_name = $routeParams.name;
    var getUrl = '/api/votes';
    if (input_name) {
      getUrl = getUrl + '/' + input_name;
    }

    $scope.voteBtn = {};
    $scope.vote = {};
    //helper functions
    $scope.moreOption = function() {
      $scope.samplePoll.options.push({name: 'Options'});
      //console.log('Add options');
    }

    $scope.optionSelect = function(poll) {
      $scope.voteBtn[poll._id].canNotSubmit = false;
    }

    $scope.editPoll = function(poll) {
      console.log('Edit poll');
      $scope.samplePoll = poll;
      $scope.newPoll = $scope.samplePoll;
    }

    $scope.updatePoll = function(updatedPoll) {
      //remove empty options
      updatedPoll.options = updatedPoll.options.filter(function(option){
        return option.name !== '';
      });
      $http.put('/api/votes/' + updatedPoll._id, updatedPoll).success(function(poll){
        $scope.initSamplePoll();
      });
    }

    $scope.resetForm = function(){
      $scope.initSamplePoll();
    }

    $scope.getPollData = function(poll) {
      var result = {};
      //create label for data set from options name
      result.labels = poll.options.map(function(option){
        return option.name;
      });
      //create data
      result.data = [
        poll.options.map(function(option){
          return option.select;
        })
      ];
      return result;
    }

    $scope.updatePollData = function(poll) {
      //disable vote button
      $scope.voteBtn[poll._id].canNotSubmit = true;
      var option_id = $scope.vote.select;
      //increase 1 to the selected option
      poll.options.map(function (option) {
        if (option._id === option_id) {
          option.select++;
        }
      });
      //update poll result
      $scope.data[poll._id] = $scope.getPollData(poll);
      //TODO it is hard to update subdocument partly, temporary update the whole object
      $http.put('/api/votes/' + poll._id, poll).then(function (response) {
        console.log(JSON.stringify(response.data));
        //$scope.showChart(response.data);
      });
    }

    $http.get(getUrl).success(function(polls){
      $scope.polls = polls;
      socket.syncUpdates('vote', $scope.polls);
      //creating useful data for polls
      angular.forEach(polls, function(poll, key){
        //generate data to use with chart
        $scope.data[poll._id] = $scope.getPollData(poll);
        //generate disable value for vote button
        $scope.voteBtn[poll._id] = {canNotSubmit: true};
      });
    });

    $scope.addPoll = function(){
      //check having poll name or any Option
      if ($scope.newPoll.name === '' || typeof($scope.newPoll.options) === 'undefined') {
        return;
      }
      console.log(JSON.stringify($scope.newPoll));
      //convert input options as a object into array to match with data schema

      var raw_options = $scope.newPoll.options;
      var options = [];
      angular.forEach(raw_options, function(option, key) {
        options.push(option);
      });
      var newPoll = {
        name: $scope.newPoll.name,
        options: options,
        user: login_id
      }
      //$scope.polls.push(newPoll);
      //console.log(newPoll._id);

      $http.post('/api/votes', newPoll).success(function(poll){
        //update $scope.polls to get _id
        //$scope.polls.pop();
        $scope.polls.push(poll);
        $scope.data[poll._id] = $scope.getPollData(poll);
        $scope.voteBtn[poll._id] = {canNotSubmit: true};
        console.log(poll._id);
      });
    };

    $scope.deletePoll = function(poll){
      $http.delete('/api/votes/'+ poll._id);
    };

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('vote');
    });

  })
