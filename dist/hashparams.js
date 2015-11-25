/* export HashParams */
/* global _ */
(function(window) {
    "use strict";
    function HashParams() {
        this.params = _.flatten(arguments);
        this.setHash("");
    }
    HashParams.prototype = {
        _encode: function(string) {
            // Based on RFC 3986 (see http://stackoverflow.com/a/2849800/87399), but
            // we also encode ',', ';', and '=' since we give them special meaning.
            return string.replace(/[^-!$&'()*+./0-9:?@A-Z_a-z~]/g, encodeURIComponent);
        },
        _getEmptyValues: function() {
            var values = {};
            _.each(this.params, function(param) {
                values[param.name] = "";
            });
            return values;
        },
        _hashToStrings: function(hash) {
            var hashData = (hash || "").replace(/^#/, "");
            var result = {};
            _.each(hashData.split(";"), function(arg) {
                var pair = arg.split("=");
                result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            });
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
        getHash: function() {
            var segments = _(this.params).map(function(param) {
                if (this.values[param.name]) {
                    return this._encode(param.name) + "=" + this._encode(this.values[param.name]);
                }
            }, this).compact().value();
            return "#" + segments.join(";");
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
