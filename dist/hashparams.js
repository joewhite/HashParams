/* export HashParams */
/* global _ */
(function(window) {
    "use strict";
    function HashParams() {
        this.params = _.clone(arguments);
        var values = {};
        for (var i = 0; i < arguments.length; ++i) {
            values[arguments[i].name] = "";
        }
        this.values = values;
    }
    HashParams.prototype = {
        setHash: function(hash) {
            hash = hash.replace(/^#/, "");
            var pair = hash.split("=");
            var newValues = {};
            _.each(this.params, function(param) {
                newValues[param.name] = "";
                if (param.name === pair[0]) {
                    newValues[param.name] = pair[1];
                }
            });
            this.values = newValues;
        }
    };
    HashParams.scalar = function(name) {
        this.name = name;
    };
    window.HashParams = HashParams;
})(this);
