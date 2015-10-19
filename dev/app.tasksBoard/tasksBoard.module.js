define([
    'angular',
    'app.tasksBoard/tasksBoard.controller'
], function (ng, tasksBoardController) {
    var taskBoardModule = ng.module('app.auth.tasksBoard', []);

    taskBoardModule.controller('TasksBoardController', tasksBoardController);

    return taskBoardModule;
});