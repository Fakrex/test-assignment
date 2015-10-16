define([

], function () {

    function config($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: './app.auth/login.html',
            controller: 'AuthController'
        })
        .when('/TaskBoard',{
            template: '<h1>Task board page</h1>'
        })
        .otherwise({
            redirectTo: '/home'
        });
    }

    config.$inject = ['$routeProvider'];

    return config;
});