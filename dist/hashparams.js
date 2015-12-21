/* export HashParams */
(function(window) {
    "use strict";
    function getEncoder(extraEncodedCharacters) {
        if (typeof extraEncodedCharacters !== "string") {
            throw new Error("Invalid type passed to getEncoder");
        }
        // Based on RFC 3986 (see http://stackoverflow.com/a/2849800/87399), but we
        // also encode ';', and possibly ',' and '=', since we give them special meaning.
        var characterClass = "^-!$&'()*+./0-9:?@A-Z_a-z~";
        [",", "="].forEach(function (char) {
            if ((extraEncodedCharacters || "").indexOf(char) < 0) {
                characterClass += char;
            }
        });
        var expression = "[" + characterClass + "]";
        var regexp = new RegExp(expression, "g");
        return function encode(string) {
            return string.replace(regexp, encodeURIComponent);
        };
    }
    var encodeNameString = getEncoder("=");
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
                    var value = this.values[param.name];
                    var clonedValue = param.cloneValue(value);
                    newValues[param.name] = clonedValue;
                }
            }, this);
            return newValues;
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
                var equalIndex = arg.indexOf("=");
                if (equalIndex < 0) {
                    equalIndex = arg.length;
                }
                var name = decodeURIComponent(arg.substr(0, equalIndex));
                var rawHashString = arg.substr(equalIndex + 1);
                var param = this._findParam(name);
                if (param) {
                    callback(name, rawHashString, param);
                }
            }, this);
            return result;
        },
        _getEmptyValues: function() {
            var values = {};
            this.params.forEach(function(param) {
                values[param.name] = param.getEmptyValue();
            });
            return values;
        },
        getHash: function() {
            var segments = [];
            this.params.forEach(function(param) {
                var rawValue = this.values[param.name];
                var encodedValue = param.valueToRawHashString(rawValue, param.encodeValueString);
                if (encodedValue) {
                    var encodedName = encodeNameString(param.name);
                    var segment = encodedName + "=" + encodedValue;
                    segments.push(segment);
                }
            }, this);
            return "#" + segments.join(";");
        },
        setHash: function(hash) {
            var values = this._getEmptyValues();
            this._forEachHashString(hash, function(name, rawHashString, param) {
                values[name] = param.rawHashStringToValue(rawHashString);
            });
            this.values = values;
        },
        with: function(name, value) {
            var newParams = new HashParams(this.params);
            var newValues = this._cloneValues();
            var param = this._findParam(name);
            if (param) {
                newValues[name] = param.resolveWith(newValues[name], value);
            }
            newParams.values = newValues;
            return newParams;
        },
        without: function(name, value) {
            var newParams = new HashParams(this.params);
            var newValues = this._cloneValues();
            var param = this._findParam(name);
            if (param) {
                newValues[name] = param.resolveWithout(newValues[name], value);
            }
            newParams.values = newValues;
            return newParams;
        }
    };

    HashParams.types = {};
    HashParams.defineType = function(properties) {
        var requiredProperties = [
            "name",
            "cloneValue",
            "getEmptyValue",
            "rawHashStringToValue",
            "resolveWith",
            "resolveWithout",
            "valueToRawHashString"
        ];
        requiredProperties.forEach(function(requiredProperty) {
            if (!(requiredProperty in properties)) {
                throw new Error("Call to defineType is missing required property " + requiredProperty);
            }
        });

        function paramType(name) {
            this.name = name;
        }
        paramType.prototype = {
            cloneValue: properties.cloneValue,
            encodeValueString: getEncoder(properties.extraEncodedCharacters || ""),
            getEmptyValue: properties.getEmptyValue,
            rawHashStringToValue: properties.rawHashStringToValue,
            resolveWith: properties.resolveWith,
            resolveWithout: properties.resolveWithout,
            valueToRawHashString: properties.valueToRawHashString
        };
        HashParams.types[properties.name] = paramType;
    };
    HashParams.defineType({
        name: "scalar",
        cloneValue: function(value) { return value; },
        getEmptyValue: function() { return ""; },
        rawHashStringToValue: function(hashString) { return decodeURIComponent(hashString); },
        resolveWith: function(oldValue, newValue) {
            if (newValue != null && typeof newValue !== "string") {
                throw new Error("HashParams: Invalid parameter type passed to 'with': " + newValue);
            }
            return newValue || "";
        },
        resolveWithout: function() {
            return "";
        },
        valueToRawHashString: function(value, encodeString) { return encodeString(value || ""); }
    });
    HashParams.defineType({
        name: "set",
        cloneValue: function(set) {
            var result = new Set();
            set.forEach(function(value) { result.add(value); });
            return result;
        },
        extraEncodedCharacters: ",",
        getEmptyValue: function() { return new Set(); },
        rawHashStringToValue: function(hashString) {
            // IE 11 doesn't support passing an array to new Set(), so do this the hard way
            var result = new Set();
            if (hashString !== "") {
                hashString.split(",").forEach(function(value) {
                    if (value) {
                        result.add(decodeURIComponent(value));
                    }
                });
            }
            return result;
        },
        resolveWith: function(oldValue, newValue) {
            if (newValue === "" || newValue == null) {
                return oldValue;
            }
            if (typeof newValue === "string") {
                oldValue.add(newValue);
                return oldValue;
            }
            if (newValue instanceof Set) {
                var result = new Set();
                newValue.forEach(function(value) { result.add(value); });
                return result;
            }
            throw new Error("HashParams: Invalid parameter type passed to 'with': " + newValue);
        },
        resolveWithout: function(oldValue, newValue) {
            if (typeof newValue === "string") {
                oldValue.delete(newValue);
                return oldValue;
            }
            return new Set();
        },
        valueToRawHashString: function(set, encodeString) {
            var values = [];
            if (set) {
                set.forEach(function(value) {
                    values.push(value);
                });
                values.sort(function(a, b) {
                    var aLower = a.toLowerCase();
                    var bLower = b.toLowerCase();
                    if (aLower < bLower) {
                        return -1;
                    } else if (aLower > bLower) {
                        return 1;
                    }
                    return 0;
                });
            }
            return values.map(encodeString).join(",");
        }
    });

    window.HashParams = HashParams;
})(this);
