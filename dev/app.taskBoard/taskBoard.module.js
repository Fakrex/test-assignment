define([
    'angular',
    'app.taskBoard/taskBoard.controller'
], function (ng, taskBoardController) {
    var taskBoardModule = ng.module('app.taskBoard', []);

    taskBoardModule.controller('TaskBoardController', taskBoardController);

    return taskBoardModule;
});