/* export HashParams */
/* global _ */
(function(window) {
    "use strict";
    function HashParams() {
        this.params = _.flatten(arguments);
        var values = {};
        for (var i = 0; i < arguments.length; ++i) {
            values[arguments[i].name] = "";
        }
        this.values = values;
    }
    HashParams.prototype = {
        _hashToStrings: function(hash) {
            var hashData = hash.replace(/^#/, "");
            var result = {};
            var pair = hashData.split("=");
            result[pair[0]] = pair[1];
            return result;
        },
        _mergeHashStrings: function(values, hashStrings) {
            _.each(this.params, function(param) {
                values[param.name] = "";
                if (param.name in hashStrings) {
                    values[param.name] = hashStrings[param.name];
                }
            });
            return values;
        },
        setHash: function(hash) {
            var hashStrings = this._hashToStrings(hash);
            this.values = this._mergeHashStrings({}, hashStrings);
        },
        with: function(name, value) {
            var newParams = new HashParams(this.params);
            newParams.values = _.clone(this.values);
            newParams.values[name] = value;
            return newParams;
        }
    };
    HashParams.scalar = function(name) {
        this.name = name;
    };
    window.HashParams = HashParams;
})(this);
