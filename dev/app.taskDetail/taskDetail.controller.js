define([

], function () {

    function taskDetailController ($scope, TaskDetailService, $stateParams, TASK_DETAIL_MESSAGE) {

        $scope.taskDetailMessage = '';
        $scope.taskDetail = {};
        $scope.taskId = $stateParams.taskId;

        $scope.getTask = function (userId, taskId) {
            TaskDetailService.getTaskDetail(userId, taskId).then(function (taskDetail) {
                $scope.taskDetail = taskDetail;
            }, function () {
                $scope.taskDetailMessage = TASK_DETAIL_MESSAGE.taskIsNotExist;
            });
        };

        $scope.saveTask = function (taskId) {

        };
    }

    taskDetailController.$inject = ['$scope', 'TaskDetailService', '$stateParams', 'TASK_DETAIL_MESSAGE'];

    return taskDetailController;

});