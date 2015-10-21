define([

], function () {

    function taskDetailService ($http, $q) {
        var taskDetailService = {};

        taskDetailService.getTaskDetail = function (userId, taskId) {
            var tasksArr = [],
                userTasksList = [],
                currentTask,
                deferred = $q.defer();

            $http.get('fakeData/allTasks.json').then(function (response) {
                tasksArr = response.data.allTasks;

                userTasksList = tasksArr.filter(function (tasksEntryItem) {
                    return tasksEntryItem.userId === userId;
                });

                if (!userTasksList.length) {
                    deferred.reject();
                } else {
                    currentTask = userTasksList[0].tasks.filter(function (taskItem) {
                        return taskItem.id === parseInt(taskId);
                    });

                    currentTask.length ? deferred.resolve(currentTask[0]) : deferred.reject();
                }

            }, function() {
                deferred.reject();
            });

            return deferred.promise;

        };

        taskDetailService.updateTaskDetail = function (taskObj) {
            //    Тут должен быть post/update запрос для обновления задачи
            var dfd = $q.defer();

            alert('Необходим backend-контроллер для сохранения задач!');
            dfd.resolve(taskObj);

            return dfd.promise;
        };

        return taskDetailService;
    }

    taskDetailService.$inject = ['$http', '$q'];

    return taskDetailService;
});