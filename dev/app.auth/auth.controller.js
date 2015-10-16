;define([

], function () {


    function authController ($scope, $rootScope, AUTH_EVENTS, AuthService) {

        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function (credentials) {
            AuthService.login(credentials).then(function (user) {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                $scope.setCurrentUser(user);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        };

        $scope.logout = function () {
            AuthService.logout().then(function() {

            });
        };

    }


    authController.$inject = ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService'];

    return authController;

});
