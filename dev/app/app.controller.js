define([

], function() {

    function appController ($scope, $location, AuthService, AUTH_EVENTS) {

        $scope.currentUser = null;
        $scope.isAuthenticated = AuthService.isAuthenticated;

        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        };

        $scope.$on(AUTH_EVENTS.loginSuccess, function (e) {
            $location.path('TaskBoard');
        });
    }

    appController.$inject = ['$scope', '$location', 'AuthService', 'AUTH_EVENTS'];

    return appController;
});