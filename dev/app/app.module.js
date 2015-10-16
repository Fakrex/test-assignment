;define([
    'angular',
    'app/app.config',
    'app.auth/auth.module',
    'angularRoute'
], function (ng, routeConfig) {

    var app = ng.module('app', ['ngRoute']);
    app.config(routeConfig);


    return app;
});