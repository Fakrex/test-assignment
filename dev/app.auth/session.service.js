;define([

], function() {

    function sessionService() {
        this.create = function (sessionId, userId) {
            this.id = sessionId;
            this.userId = userId;
        };

        this.destroy = function () {
            delete this.id;
            delete this.userId;
        };
    }

    return sessionService;
});