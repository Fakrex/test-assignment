define([

], function () {

    function tasksBoardService($http, $q) {
        var tasksBoardService = {};

        tasksBoardService.getUserTasks = function (userId) {
            var tasksArr = [],
                currentTasksEntry,
                deferred = $q.defer();

            $http.get('fakeData/allTasks.json').then(function(response) {
                tasksArr = response.data.allTasks;

                currentTasksEntry = tasksArr.filter(function(tasksEntryItem) {
                    return tasksEntryItem.userId === userId;
                });

                currentTasksEntry.length ? deferred.resolve(currentTasksEntry[0].tasks) : deferred.resolve(currentTasksEntry);

            }, function() {
                deferred.reject();
            });

            return deferred.promise;
        };

        tasksBoardService.updateTask = function(taskObj) {
        //    Тут должен быть post/update запрос для обновления задачи
            var dfd = $q.defer();

            alert('Необходим backend-контроллер для сохранения задач!');
            dfd.resolve(taskObj);

            return dfd.promise;
        };


        return tasksBoardService;
    }

    tasksBoardService.$inject = ['$http', '$q'];


    return tasksBoardService;
});