define([

], function() {

    function dateParser(uglyFormatStrDate) {
        var dateComponents = uglyFormatStrDate.split('.');

        return new Date(dateComponents[2], dateComponents[1], dateComponents[0]);
    }

    return dateParser;

});