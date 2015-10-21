;define([
    'angular',
    'app/app.config',
    'app/app.controller',
    'app.auth/auth.module',
    'app.tasksBoard/tasksBoard.module',
    'app.taskDetail/taskDetail.module',
    'angularUiRoute'
], function (ng, routeConfig, appController) {

    var app = ng.module('app', ['ui.router', 'app.auth', 'app.tasksBoard', 'app.taskDetail']);
    app.config(routeConfig);
    app.controller('ApplicationController', appController);


    return app;
});