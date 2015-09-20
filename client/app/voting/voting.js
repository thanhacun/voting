'use strict';

angular.module('votingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/voting/voting.html',
        controller: 'VotingCtrl',
        //authenticate: true
      });
  });
