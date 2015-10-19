define([
    'angular',
    'app.auth/auth.service',
    'app.auth/session.service',
    'app.auth/auth.controller',
    'app.auth/authEvents.constant',
    'app.auth/authMessages.constant'
], function (ng, authService, sessionService, authController, authEventsConst, authMessagesConst) {
    var authModule = ng.module('app.auth', []);
    authModule.constant('AUTH_EVENTS', authEventsConst);
    authModule.constant('AUTH_MESSAGES', authMessagesConst);
    authModule.factory('AuthService', authService);
    authModule.service('Session', sessionService);
    authModule.controller('AuthController', authController);

    return authModule;
});