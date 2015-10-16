;define([

], function() {

    function authService(Session) {
        var authService = {};

        authService.login = function(credentials) {

        };

        authService.logout = function () {

        };

        authService.isAuthenticated = function () {
            return !!Session.userId;
        };

        return authService;
    }

    authService.$inject = ['Session'];

    return authService;
});