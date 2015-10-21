define([

], function () {

    var _GRID_COLUMNS_CONFIG =  [
        {name: 'id', enableCellEdit: false, visible: false},
        {name: 'title', displayName: 'Название', enableCellEdit: false},
        {name: 'description', displayName: 'Описание', visible: false},
        {name: 'state', displayName: 'Статус' },
        {name: 'date', displayName: 'Дата', enableCellEdit: false},
        {name: 'priority', displayName: 'Приоритет', enableCellEdit: false},
        {name: 'time_estimate', displayName: 'Планируемое время', type: 'number', enableFiltering: false},
        {name: 'time_elapsed', displayName: 'Затраченное время', type: 'number', enableFiltering: false},
        {name: 'entry_actions', displayName: 'Действия', enableFiltering: false, cellTemplate: '<a ui-sref="private.taskDetail({taskId: row.entity.id})">Подробнее</a>'}
    ];

    return _GRID_COLUMNS_CONFIG;

});