/* export HashParams */
(function(window) {
    "use strict";
    function HashParams() {
        var params;
        if (Array.isArray(arguments[0])) {
            params = arguments[0];
        } else {
            params = Array.prototype.slice.call(arguments);
        }
        this.params = params.map(function(param, index) {
            if (typeof param === "string") {
                var matches = /^([^:]*):?(.*)$/.exec(param);
                var paramName = matches[1];
                if (paramName === "") {
                    throw new Error("HashParams: Invalid parameter name: " + param);
                }
                var paramType = matches[2] || "scalar";
                if (!(paramType in HashParams.types)) {
                    throw new Error("HashParams: Invalid parameter type: " + param);
                }
                return new HashParams.types[paramType](paramName);
            } else if (param && param.name) {
                return param;
            } else {
                throw new Error("HashParams: Invalid parameter definition at index " + index);
            }
        });
        this.setHash("");
    }
    HashParams.prototype = {
        _cloneValues: function() {
            var newValues = {};
            this.params.forEach(function(param) {
                if (param.name in this.values) {
                    newValues[param.name] = this.values[param.name];
                }
            }, this);
            return newValues;
        },
        _encode: function(string) {
            // Based on RFC 3986 (see http://stackoverflow.com/a/2849800/87399), but
            // we also encode ',', ';', and '=' since we give them special meaning.
            return string.replace(/[^-!$&'()*+./0-9:?@A-Z_a-z~]/g, encodeURIComponent);
        },
        _findParam: function(name) {
            for (var i = 0; i < this.params.length; ++i) {
                var param = this.params[i];
                if (param.name === name) {
                    return param;
                }
            }
        },
        _forEachHashString: function(hash, callback) {
            var hashData = (hash || "").replace(/^#/, "");
            var result = {};
            hashData.split(";").forEach(function(arg) {
                var pair = arg.split("=");
                var name = decodeURIComponent(pair[0]);
                var paramString = decodeURIComponent(pair[1]);
                callback(name, paramString);
            });
            return result;
        },
        _getEmptyValues: function() {
            var values = {};
            this.params.forEach(function(param) {
                values[param.name] = param.getEmptyValue();
            });
            return values;
        },
        _mergeHashString: function(values, name, hashString) {
            var param = this._findParam(name);
            if (param) {
                values[name] = hashString;
            }
        },
        getHash: function() {
            var segments = [];
            this.params.forEach(function(param) {
                if (this.values[param.name]) {
                    var segment = this._encode(param.name) + "=" + this._encode(this.values[param.name]);
                    segments.push(segment);
                }
            }, this);
            return "#" + segments.join(";");
        },
        setHash: function(hash) {
            var self = this;
            var values = this._getEmptyValues();
            this._forEachHashString(hash, function(name, paramString) {
                self._mergeHashString(values, name, paramString);
            });
            this.values = values;
        },
        with: function(name, value) {
            var newParams = new HashParams(this.params);
            var newValues = this._cloneValues();
            this._mergeHashString(newValues, name, value);
            newParams.values = newValues;
            return newParams;
        }
    };

    HashParams.types = {};
    HashParams.defineType = function(properties) {
        var requiredProperties = "name getEmptyValue";
        requiredProperties.split(" ").forEach(function(requiredProperty) {
            if (!(requiredProperty in properties)) {
                throw new Error("Call to defineType is missing required property " + requiredProperty);
            }
        });

        function paramType(name) {
            this.name = name;
        }
        paramType.prototype = {
            getEmptyValue: properties.getEmptyValue
        };
        HashParams.types[properties.name] = paramType;
    };
    HashParams.defineType({
        name: "scalar",
        getEmptyValue: function() { return ""; }
    });
    HashParams.defineType({
        name: "set",
        getEmptyValue: function() { return new Set(); }
    });

    window.HashParams = HashParams;
})(this);
