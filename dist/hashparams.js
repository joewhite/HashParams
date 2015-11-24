/* export HashParams */
(function(window) {
    "use strict";
    function HashParams() {
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
            this.values[pair[0]] = pair[1];
        }
    };
    HashParams.scalar = function(name) {
        this.name = name;
    };
    window.HashParams = HashParams;
})(this);
