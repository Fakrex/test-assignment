define(['auth/auth.config',
        'auth/auth.service',
        'auth/session.service',
        'auth/auth.controller'],

function(config, authService, sessionService, authController){
    var app = angular.module('authModule', ['ngRoute','ngResource','ngGrid']);
    app.config(config);
    app.factory('AuthService',authService);
    app.factory('SessionService', sessionService);
    app.controller('AuthController',authController);
});