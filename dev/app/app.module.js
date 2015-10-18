;define([
    'angular',
    'app/app.config',
    'app/app.controller',
    'app.auth/auth.module',
    'angularRoute'
], function (ng, routeConfig, appController) {

    var app = ng.module('app', ['ngRoute']);
    app.config(routeConfig);
    app.controller('ApplicationController', appController);


    return app;
});