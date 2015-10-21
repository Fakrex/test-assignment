define([
    'angular',
    'app.tasksBoard/tasksBoard.controller',
    'app.tasksBoard/tasksBoard.service',
    'app.tasksBoard/tasksBoardMessages.constant',
    'app.tasksBoard/tasksBoard.gridColumns.config.constant',
    'angularUiGrid'
], function (ng, tasksBoardController, tasksBoardService, tasksBoardMessagesConst, gridColumnsConfigConst) {
    var tasksBoardModule = ng.module('app.tasksBoard', ['ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav' ]);

    tasksBoardModule.constant('GRID_COLUMNS_CONFIG', gridColumnsConfigConst);
    tasksBoardModule.constant('TASKS_BOARD_MESSAGES', tasksBoardMessagesConst);
    tasksBoardModule.controller('TasksBoardController', tasksBoardController);
    tasksBoardModule.factory('TasksBoardService', tasksBoardService);

    return tasksBoardModule;
});