/* export HashParams */
/* global _ */
(function(window) {
    "use strict";
    function HashParams() {
        this.params = _.flatten(arguments);
        this.setHash("");
    }
    HashParams.prototype = {
        _getEmptyValues: function() {
            var values = {};
            _.each(this.params, function(param) {
                values[param.name] = "";
            });
            return values;
        },
        _hashToStrings: function(hash) {
            var hashData = hash.replace(/^#/, "");
            var result = {};
            var pair = hashData.split("=");
            result[pair[0]] = pair[1];
            return result;
        },
        _mergeHashStrings: function(values, hashStrings) {
            _.each(this.params, function(param) {
                if (param.name in hashStrings) {
                    values[param.name] = hashStrings[param.name];
                }
            });
            return values;
        },
        setHash: function(hash) {
            var hashStrings = this._hashToStrings(hash);
            this.values = this._mergeHashStrings(this._getEmptyValues(), hashStrings);
        },
        with: function(name, value) {
            var newParams = new HashParams(this.params);
            var newStrings = {};
            newStrings[name] = value;
            newParams.values = this._mergeHashStrings(_.clone(this.values), newStrings);
            return newParams;
        }
    };
    HashParams.scalar = function(name) {
        this.name = name;
    };
    window.HashParams = HashParams;
})(this);
