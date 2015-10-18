;define([

], function() {

    function authService($http, $q, $filter, Session) {
        var authService = {};

        authService.login = function(credentials) {
            var usersArr,
                currentUser;

            var deferred = $q.defer();

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

            return deferred.promise;
        };

        authService.logout = function () {

        };

        authService.isAuthenticated = function () {
            return !!Session.userId;
        };

        return authService;
    }

    authService.$inject = ['$http', '$q', '$filter', 'Session'];

    return authService;
});