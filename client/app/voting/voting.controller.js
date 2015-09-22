'use strict';

angular.module('votingApp')
  .controller('VotingCtrl', function ($scope, $http, $routeParams, $location, socket, Auth) {
    $scope.polls = [];
    $scope.initSamplePoll = function() {
      console.log('Init sample data');
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
    $scope.inputPollId = $routeParams.poll_id;
    $scope.inputName = $routeParams.name;
    var getUrl = '/api/votes';
    if ($scope.inputName) {
      getUrl = getUrl + '/' + $scope.inputName;
    }
    $scope.absUrl = $location.absUrl();
    $scope.voteBtn = {};
    $scope.vote = {};
    //helper functions
    $scope.moreOption = function() {
      console.log('Add more options');
      $scope.samplePoll.options.push({name: 'Options'});
    };

    $scope.optionSelect = function(poll) {
      $scope.voteBtn[poll._id].canNotSubmit = false;
    };

    $scope.editPoll = function(poll) {
      console.log('Edit poll');
      $scope.samplePoll = poll;
      $scope.newPoll = $scope.samplePoll;
    };

    $scope.updatePoll = function(updatedPoll) {
      console.log(JSON.stringify(updatedPoll));
      //remove empty options
      updatedPoll.options = updatedPoll.options.filter(function(option){
        return option.name !== '';
      });
      $http.put('/api/votes/' + updatedPoll._id, updatedPoll).success(function(poll){
        $scope.initSamplePoll();
        $scope.getPollData(poll);
        console.log('Update poll', JSON.stringify(poll));
      });
    };

    $scope.resetForm = function(){
      console.log('Reset');
      $scope.initSamplePoll();
    };

    $scope.getPollData = function(poll) {
      var result = {};
      //create labels for data set from options name
      result.labels = poll.options.map(function(option){
        return option.name;
      });
      //create data
      result.data = [
        poll.options.map(function(option){
          return option.select;
        })
      ];
      console.log('Get poll data', JSON.stringify(result));
      return result;
    };

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
      $http.put('/api/votes/' + poll._id, poll).success(function (updatedPoll) {
        console.log('Update poll data', JSON.stringify(updatedPoll));
      });
    };

    $http.get(getUrl).success(function(polls){
      $scope.polls = polls;
      socket.syncUpdates('vote', $scope.polls);
      console.log(JSON.stringify(polls));
      //creating useful data for polls
      angular.forEach(polls, function(poll){
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
      //convert input options as a object into array to match with data schema
      var raw_options = $scope.newPoll.options;
      var options = [];
      angular.forEach(raw_options, function(option) {
        options.push(option);
      });
      var newPoll = {
        name: $scope.newPoll.name,
        options: options,
        user: $scope.currentUser
      };
      $scope.polls.push(newPoll);
      $http.post('/api/votes', newPoll).success(function(poll){
        //update $scope.polls to make sure polls having _id
        poll.user = {
          _id: poll.user,
          name: $scope.currentUser.name
        };
        $scope.polls.pop();
        $scope.polls.push(poll);
        $scope.data[poll._id] = $scope.getPollData(poll);
        $scope.voteBtn[poll._id] = {canNotSubmit: true};
        $scope.initSamplePoll();
        console.log('Add new poll:', JSON.stringify(poll));
      });
    };

    $scope.deletePoll = function(poll){
      if(confirm('Are you sure')) {
        console.log('Delete poll', JSON.stringify(poll));
        $http.delete('/api/votes/'+ poll._id)
      }
    };

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('vote');
    });

  })
  //directives
  //Making bootstrap tooltip work with angularjs
  //inspired from http://stackoverflow.com/questions/20666900/using-bootstrap-tooltip-with-angularjs
  //TODO: a directive for cofirm dialog on delete
  .directive('tooltip', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        $(element).hover(function() {
          $(element).tooltip('show');
        }, function() {
          $(element).tooltip('hide');
        });
      }
    };
  });
