define([

], function() {

    function appController ($scope, AuthService) {

        $scope.currentUser = null;
        $scope.isAuthenticated = AuthService.isAuthenticated;

        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        }
    }

    appController.$inject = ['$scope', 'AuthService'];

    return appController;
});