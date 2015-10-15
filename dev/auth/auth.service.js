;define([

], function() {

    function authService(Session) {
        this.login = function(credentials) {

        };

        this.logout = function () {

        };

        this.isAuthenticated = function () {
            return !!Session.id;
        };
    }

    authService.$inject = ['Session'];

    return authService;
});