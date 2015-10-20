define([
    'angular',
    'app.tasksBoard/tasksBoard.controller',
    'app.tasksBoard/tasksBoard.service',
    'app.tasksBoard/tasksBoardMessages.constant',
    'angularUiGrid'
], function (ng, tasksBoardController, tasksBoardService, tasksBoardMessagesConst) {
    var taskBoardModule = ng.module('app.tasksBoard', ['ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav' ]);

    taskBoardModule.constant('TASKS_BOARD_MESSAGES', tasksBoardMessagesConst);
    taskBoardModule.controller('TasksBoardController', tasksBoardController);
    taskBoardModule.factory('TasksBoardService', tasksBoardService);

    return taskBoardModule;
});