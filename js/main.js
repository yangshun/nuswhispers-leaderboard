var app = angular.module('LeaderboardApp', []);

app.controller('LeaderboardController', function ($scope, $http) {

  $http.get('/leaderboard/latest.json').success(function (data) {
    $scope.leaderboard = data;
    setTimeout(function () {
      $scope.loaded = true;
      $('.leaderboard-table tbody tr').each(function (index) {
        // console.log(row)
        (function (delay, el) {
          setTimeout(function () {
            $(el).addClass('animated fadeInLeft');
          }, delay);
        })(index * 100, this);
      });
      $scope.$apply();
    }, 0);
  });
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
