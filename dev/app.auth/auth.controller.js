;define([

], function () {


    function authController ($scope, $rootScope, AUTH_EVENTS, AUTH_MESSAGES, AuthService) {

        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.message = '';

        $scope.login = function (credentials) {
            AuthService.login(credentials).then(function (user) {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                $scope.setCurrentUser(user);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                $scope.message = AUTH_MESSAGES.loginFailed;
                angular.element(document.querySelector('.login-form__message')).addClass('error');
            });
        };

        $scope.logout = function () {
            AuthService.logout().then(function() {
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                $scope.resetCurrentUser();
            });
        };

        $scope.$on(AUTH_EVENTS.notAuthenticated, function (e) {
            angular.element(document.querySelector('.login-form__message')).addClass('error');
            $scope.message = AUTH_MESSAGES.isNotAuthorized;
        });

    }


    authController.$inject = ['$scope', '$rootScope', 'AUTH_EVENTS', 'AUTH_MESSAGES', 'AuthService'];

    return authController;

});
