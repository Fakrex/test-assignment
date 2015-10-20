;define([

], function() {

    function authService($http, $q, Session) {
        var authService = {};

        authService.login = function(credentials) {
            var usersArr,
                currentUser;

            // При законченной реализации, наличии backend-a (контроллера для авторизации, возвращающего учётку вошедшего юзера),
            // нет необходимости в deferred объекте, достаточно promise от $http
            var deferred = $q.defer();

            if(credentials.username && credentials.password){
                $http.get('fakeData/users.json', {data: credentials})
                    .then(function(response) {
                        usersArr = response.data.users;

                        // Эта фильтрации тоже будет ненужной
                        usersArr = usersArr.filter(function(userItem) {
                            return (userItem.username === credentials.username && userItem.password === credentials.password);
                        });

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

    authService.$inject = ['$http', '$q', 'Session'];

    return authService;
});