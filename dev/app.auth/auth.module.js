define([
    'angular',
    'app.auth/auth.service',
    'app.auth/session.service',
    'app.auth/auth.controller',
    'app.auth/authEvents.constant'
], function (ng, authService, sessionService, authController, authEventsConst) {
    var authModule = ng.module('app.auth', []);
    authModule.constant('AUTH_EVENTS', authEventsConst);
    authModule.factory('AuthService', authService);
    authModule.service('Session', sessionService);
    authModule.controller('AuthController', authController);

    return authModule;
});