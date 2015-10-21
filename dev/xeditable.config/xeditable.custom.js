define([

], function () {

    function customXeditable(editableOptions, editableThemes) {
        editableOptions.theme = 'bs3';

        editableThemes['default'].submitTpl = '<button class="xeditable-submit button--green" type="submit"><i class="fa fa-check"></i></button>';
        editableThemes['default'].cancelTpl = '<button class="xeditable-cancel button--red"><i class="fa fa-times"></i></button>';
    }

    return customXeditable;
});