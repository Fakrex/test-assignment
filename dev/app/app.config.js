define([
    "text!app.auth/login.html",
    "text!app.auth/private.html",
    "text!app.tasksBoard/tasksBoard.html",
    "text!app.taskDetail/taskDetail.html"
], function (loginTemplate, privateTemplate, tasksBoardTemplate, taskDetailTemplate) {

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                template: loginTemplate,
                controller: 'AuthController',
                needForAuth: false
            })
            .state('private', {
                abstract: true,
                url: '/privateApp',
                template: privateTemplate,
                controller: 'AuthController',
                needForAuth: true
            })
                .state('private.tasksBoard', {
                    url: '/TasksBoard',
                    template: tasksBoardTemplate,
                    controller: 'TasksBoardController',
                    needForAuth: true
                })
                .state('private.taskDetail', {
                    url: '/taskDetail/:taskId',
                    template: taskDetailTemplate,
                    controller: 'TaskDetailController',
                    needForAuth: true
                });

    }

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    return config;
});