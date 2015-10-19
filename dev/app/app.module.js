;define([
    'angular',
    'app/app.config',
    'app/app.controller',
    'app.auth/auth.module',
    'angularUIRoute'
], function (ng, routeConfig, appController) {

    var app = ng.module('app', ['ui.router']);
    app.config(routeConfig);
    app.controller('ApplicationController', appController);


    return app;
});