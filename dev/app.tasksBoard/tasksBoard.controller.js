define([

], function () {

    function tasksBoardController ($scope, TasksBoardService, TASKS_BOARD_MESSAGES, uiGridConstants, GRID_COLUMNS_CONFIG) {

        $scope.tasksBoardMessage = '';
        $scope.gridOptions = {};

        $scope.getCurrentUserTasks = function (userId) {
            TasksBoardService.getUserTasks(userId).then(function(tasksList) {

                if (!tasksList.length) {
                    $scope.tasksBoardMessage = TASKS_BOARD_MESSAGES.tasksListIsEmpty;
                } else {
                    $scope.gridOptions.data = tasksList;
                }

            }, function () {
                $scope.tasksBoardMessage = TASKS_BOARD_MESSAGES.tasksLoadFailed;
            });
        };

        $scope.saveRow = function (rowEntity) {
            $scope.gridApi.rowEdit.setSavePromise( rowEntity, TasksBoardService.updateTask(rowEntity));
        };

        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
        };
        $scope.gridOptions.enableFiltering = false;
        $scope.gridOptions.columnDefs = GRID_COLUMNS_CONFIG;

        $scope.toggleFiltering = function () {
            $scope.gridOptions.enableFiltering = !$scope.gridOptions.enableFiltering;
            $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
        };

    }

    tasksBoardController.$inject = ['$scope', 'TasksBoardService', 'TASKS_BOARD_MESSAGES', 'uiGridConstants', 'GRID_COLUMNS_CONFIG'];

    return tasksBoardController;
});