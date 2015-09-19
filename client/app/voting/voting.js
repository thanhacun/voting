'use strict';

angular.module('votingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/voting/:name', {
        templateUrl: 'app/voting/voting.html',
        controller: 'VotingCtrl',
        //authenticate: true
      });
  });
