var app = angular.module('LeaderboardApp', []);

app.controller('LeaderboardController', function ($scope, $http) {

  $http.get('leaderboard/latest.json').success(function (data) {
    $scope.leaderboard = data;
    $scope.$apply();
    $('.table-container').addClass('shown');
  });
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
