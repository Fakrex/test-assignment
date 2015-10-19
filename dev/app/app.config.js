define([
    "text!app.auth/login.html",
    "text!app.private/private.html"
], function (loginTemplate, privateTemplate) {

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                template: loginTemplate,
                controller: 'AuthController'
            })
            .state('private', {
                abstract: true,
                url: '/privateApp',
                template: privateTemplate
            })
            .state('private.taskBoard', {
                url: '/TaskBoard',
                template: '<h1>Task board page</h1>'
            });

    }

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    return config;
});