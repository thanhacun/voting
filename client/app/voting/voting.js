'use strict';

angular.module('votingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/voting', {
        templateUrl: 'app/voting/voting.html',
        controller: 'VotingCtrl'
      });
  });
