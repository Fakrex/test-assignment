;define([

], function() {

    function authService($http, $q, $filter, Session) {
        var authService = {};

        authService.login = function(credentials) {
            var usersArr,
                currentUser;

            // При законченной реализации, наличии backend-a (контроллера для авторизации, возвращающего учётку текущего юзера),
            // нет необходимости в deferred объекте, достаточно promise от $http
            var deferred = $q.defer();

            if(credentials.username && credentials.password){
                $http.get('fakeData/users.json', {data: credentials})
                    .then(function(response) {
                        usersArr = response.data.users;
                        usersArr = $filter('filter')(usersArr, credentials);

                        if (usersArr.length) {
                            currentUser = usersArr[0];
                            Session.create(currentUser.sessionId, currentUser.id);
                            deferred.resolve(currentUser);
                        } else {
                            deferred.reject();
                        }
                    });
            } else {
                deferred.reject();
            }


            return deferred.promise;
        };

        authService.logout = function () {
            var deferred = $q.defer();

            Session.destroy();
            deferred.resolve();

            return deferred.promise;
        };

        authService.isAuthenticated = function () {
            return !!Session.userId;
        };

        return authService;
    }

    authService.$inject = ['$http', '$q', '$filter', 'Session'];

    return authService;
});