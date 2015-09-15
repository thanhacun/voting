'use strict';

angular.module('votingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/voting/:email', {
        templateUrl: 'app/voting/voting.html',
        controller: 'VotingCtrl'
      });
  });
