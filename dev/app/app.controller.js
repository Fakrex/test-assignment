define([

], function() {

    function appController ($rootScope, $scope, $state, AuthService, AUTH_EVENTS) {

        $scope.currentUser = null;
        $scope.isAuthenticated = false;

        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
            $scope.isAuthenticated = AuthService.isAuthenticated;
        };

        $scope.resetCurrentUser = function () {
            $scope.currentUser = null;
            $scope.isAuthenticated = false;
        };

        $scope.$on(AUTH_EVENTS.loginSuccess, function (e) {
            $state.go('private.taskBoard');
        });

        //Закрытие доступа для не аутентифицированного пользователя
        //$rootScope.$on('$stateChangeStart',
        //    function(event, toState, toParams, fromState, fromParams){
        //        if(!$scope.isAuthenticated && toState.name !== 'login') {
        //            event.preventDefault();
        //            $state.go('login');
        //            $scope.$broadcast(AUTH_EVENTS.notAuthenticated);
        //        }
        //    });

    }

    appController.$inject = ['$rootScope', '$scope', '$state', 'AuthService', 'AUTH_EVENTS'];

    return appController;
});