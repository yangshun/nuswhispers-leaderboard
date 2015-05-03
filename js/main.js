var app = angular.module('LeaderboardApp', []);

app.controller('LeaderboardController', function ($scope, $http) {
  $http.get('/leaderboard/latest.json').success(function (data) {
    console.log(data);
    $scope.leaderboard = data;
  });
});
