define([
    "fakeData/dateParser"
], function (dateParser) {

    function taskDetailController ($scope, TaskDetailService, $stateParams, TASK_DETAIL_MESSAGE, TASK_DETAIL_NOTIFY, $timeout) {

        $scope.taskDetailMessage = '';
        $scope.taskDetail = {};
        $scope.opened = false;
        $scope.taskId = $stateParams.taskId;
        $scope.taskDetailNotify = '';


        $scope.getTask = function (userId, taskId) {
            TaskDetailService.getTaskDetail(userId, taskId).then(function (taskDetail) {
                taskDetail.date = dateParser(taskDetail.date);
                $scope.taskDetail = taskDetail;
            }, function () {
                $scope.taskDetailMessage = TASK_DETAIL_MESSAGE.taskIsNotExist;
            });
        };

        $scope.saveTask = function (taskObj) {
            var $notice = angular.element(document.querySelector('.task-field-set__notify'));
            $notice.removeClass('error success hidden visible');

            TaskDetailService.updateTaskDetail(taskObj).then(function () {
                $scope.taskDetailNotify = TASK_DETAIL_NOTIFY.success;
                $notice.addClass('success visible');
                $timeout(function () {
                    $notice.addClass('hidden').removeClass('visible');
                }, 2000);

            }, function () {
                $scope.taskDetailNotify = TASK_DETAIL_NOTIFY.fail;
                $notice.addClass('error visible');
                $timeout(function () {
                    $notice.addClass('hidden').removeClass('visible');
                }, 2000);
            });
        };

        $scope.validateTask = function () {
        //    Здесь должна быть валидация
        };
    }

    taskDetailController.$inject = ['$scope', 'TaskDetailService', '$stateParams', 'TASK_DETAIL_MESSAGE', 'TASK_DETAIL_NOTIFY', '$timeout'];

    return taskDetailController;

});