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
        _getEmptyValues: function() {
            var values = {};
            this.params.forEach(function(param) {
                values[param.name] = param.getEmptyValue();
            });
            return values;
        },
        _hashToStrings: function(hash) {
            var hashData = (hash || "").replace(/^#/, "");
            var result = {};
            hashData.split(";").forEach(function(arg) {
                var pair = arg.split("=");
                result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            });
            return result;
        },
        _mergeHashStrings: function(values, hashStrings) {
            this.params.forEach(function(param) {
                if (param.name in hashStrings) {
                    values[param.name] = hashStrings[param.name];
                }
            });
            return values;
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
            var hashStrings = this._hashToStrings(hash);
            this.values = this._mergeHashStrings(this._getEmptyValues(), hashStrings);
        },
        with: function(name, value) {
            var newParams = new HashParams(this.params);
            var newStrings = {};
            newStrings[name] = value;
            newParams.values = this._mergeHashStrings(this._cloneValues(), newStrings);
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
