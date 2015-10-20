define([

], function () {

    function tasksBoardController($scope, TasksBoardService, TASKS_BOARD_MESSAGES) {

        $scope.currentUserTasksList = [];
        $scope.tasksBoardMessage = '';
        $scope.gridOptions = {};

        $scope.getCurrentUserTasks = function (userId) {
            TasksBoardService.getUserTasks(userId).then(function(tasksList) {
                $scope.currentUserTasksList = tasksList;
                $scope.gridOptions.data = tasksList;

                if (!tasksList.length) {
                    $scope.tasksBoardMessage = TASKS_BOARD_MESSAGES.tasksListIsEmpty;
                }

            }, function () {
                $scope.tasksBoardMessage = TASKS_BOARD_MESSAGES.tasksLoadFailed;
            });
        };

        $scope.saveRow = function (rowEntity) {
            $scope.gridApi.rowEdit.setSavePromise( rowEntity, TasksBoardService.updateTask(rowEntity));
        };


        $scope.gridOptions.onRegisterApi = function(gridApi){
            $scope.gridApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
        };

        $scope.gridOptions.columnDefs = [
                {name: 'id', enableCellEdit: false, visible: false},
                {name: 'title', displayName: 'Название'},
                {name: 'description', displayName: 'Описание', visible: false},
                {name: 'state', displayName: 'Статус' },
                {name: 'date', displayName: 'Дата'},
                {name: 'priority', displayName: 'Приоритет'},
                {name: 'time_estimate', displayName: 'Планируемое время', type: 'number'},
                {name: 'time_elapsed', displayName: 'Затраченное время', type: 'number'},
                {name: 'entry_actions', displayName: 'Действия'}
            ];

    }

    tasksBoardController.$inject = ['$scope', 'TasksBoardService', 'TASKS_BOARD_MESSAGES'];

    return tasksBoardController;
});