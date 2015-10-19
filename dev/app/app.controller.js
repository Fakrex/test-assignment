define([

], function() {

    function appController ($rootScope, $scope, $state, AuthService, AUTH_EVENTS) {

        $scope.currentUser = null;
        $scope.isAuthenticated = AuthService.isAuthenticated;

        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        };

        $scope.resetCurrentUser = function () {
            $scope.currentUser = null;
        };

        $scope.$on(AUTH_EVENTS.loginSuccess, function (e) {
            $state.transitionTo('private.tasksBoard');
        });

        $scope.$on(AUTH_EVENTS.logoutSuccess, function(e) {
            $state.transitionTo('login');
        });

        //Закрытие доступа для не аутентифицированного пользователя
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                if (toState.needForAuth && !$scope.isAuthenticated()) {
                    event.preventDefault();
                    $state.transitionTo('login');
                    $scope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            });

    }

    appController.$inject = ['$rootScope', '$scope', '$state', 'AuthService', 'AUTH_EVENTS'];

    return appController;
});