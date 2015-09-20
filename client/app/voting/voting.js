'use strict';

angular.module('votingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/voting/voting.html',
        controller: 'VotingCtrl',
        //authenticate: true
      })
      .when('/:name', {
        templateUrl: 'app/voting/voting.html',
        controller: 'VotingCtrl'
      })
      .when('/:name/:title', {
        templateUrl: 'app/voting/voting.html',
        controller: 'VotingCtrl'
      });
  });
