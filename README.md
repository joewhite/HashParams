# HashParams

HashParams is a JavaScript library that lets you treat a URL hash ([officially](https://tools.ietf.org/html/rfc3986#section-3.5) the "fragment identifier") as a set of named parameters. You can parse hash strings and build new ones.

```javascript
var params = new HashParams("foreground", "background", "tags:set");

// User is on page.html#foreground=blue;background=green;tags=a,b. We can parse the hash:
params.setHash(window.location.hash);
// params.values.foreground === "blue"
// params.values.background === "green"
// params.values.tags is a Set containing "a" and "b"

// To build a hyperlink that changes foreground:
var newUrl = params.with("foreground", "red").getHash();
// newUrl is "#foreground=red;background=green;tags=a,b"
```

HashParams is tested in the evergreen browsers (FireFox, Chrome, IE 11, and Edge). It may or may not work in older browsers.

## Installing

You can install the latest release of HashParams using [Bower](http://bower.io/):

    bower install hashparams

Or get the bleeding-edge version by grabbing [hashparams.js](../../raw/master/dist/hashparams.js) from the [dist](../../tree/master/dist) folder.

## Typical usage without React.js

```javascript
var params = new HashParams("foreground", "background");
function hashChanged() {
    params.setHash(window.location.hash);
    // do something with params.values
}
window.addEventListener("hashchange", hashChanged);
hashChanged();
```

## Typical usage with React.js

```javascript
// In one of your React components:
var ... = React.createComponent(
    ...
    getInitialState: function() {
        return {
            paramValues: {}
        };
    },
    componentDidMount: function() {
        var params = new HashParams("foreground", "background");
        var self = this;
        function hashChanged() {
            params.setHash(window.location.hash);
            self.setState({paramValues: params.values});
        }
        window.addEventListener("hashchange", hashChanged);
        hashChanged();
    },
    render: function() {
        // do something with this.state.paramValues
    },
    ...
);
```

## HashParams documentation

### Constructor

The `HashParams` constructor takes a list of parameter names that your page expects, with optional types:

```javascript
var params = new HashParams("foreground", "background", "tags:set");
// params.values.foreground and params.values.background are strings
// params.tags is a JavaScript Set object
```

Currently supported types are:

* `scalar` (default): a single string value.
* `set`: multiple (comma-separated) values, which are stored in a [JavaScript `Set` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

If you want, you can also pass instances of `HashParams.types.scalar` or `HashParams.types.set`.

```javascript
new HashParams(new HashParams.types.scalar("foreground"), new HashParams.types.set("tags"))
```

The current version does not support wildcards; you need to explicitly list every parameter name your page will use.

### values

The `values` property contains the currently-parsed parameter values, as a JavaScript object.

When the `HashParams` instance is first created, `values` contains an empty string for each scalar parameter, and an empty `Set` for each set parameter:

```javascript
var params = new HashParams("foreground", "background", "tags:set");
// params.values.foreground === ""
// params.values.background === ""
// params.values.tags is initialized to a new Set()
```

You can modify `values`, though this is discouraged. It's better to use the `with` and `without` methods (see below).

### setHash(hashString)

The `setHash` method takes a string of the form `#name1=value1;name2=value2` (the leading `#` is optional) and parses its values into the `values` property.

```javascript
var params = new HashParams("foreground", "background", "tags:set");
// window.location.hash is "#foreground=blue;background=green;tags=a,b"
params.setHash(window.location.hash);
// params.values.foreground === "blue"
// params.values.background === "green"
// params.values.tags is a new Set() containing "a" and "b"
```

The hash string can contain any characters from the Unicode Basic Multilingual Plane (U+0000 through U+FFFF), but currently won't work with UTF-16 surrogate pairs.

To ensure proper behavior as you navigate backwards and forwards through browser history, `setHash` clears any parameter values that are not included in the hash string:

```javascript
var params = new HashParams("foreground", "background");
params.setHash("#foreground=blue;background=green");
// Then later:
params.setHash("#foreground=red");
// Now values.background has been reset to ""
```

### with(parameterName, newValue)

The `with` method returns a new clone of the `HashParams` object, with a new value for the specified parameter.

```javascript
var params = new HashParams("foreground", "background");
params.setHash("#foreground=blue;background=green");
var newParams = params.with("foreground", "red");
expect(newParams.values).toEqual({foreground: "red", background: "green"});
```

The original `HashParams` instance is not modified.

Typically you would call `with` and then immediately call `getHash` on the result, and put the resulting URL into a hyperlink. For example, in React:

```html
<a href={params.with("foreground", "red").getHash()}>Change foreground to red</a>
```

### without(parameterName[, value])

The `without` method returns a new clone of the `HashParams` object, with the specified parameter either cleared completely, or with a single value removed from the set.

If only `parameterName` is specifieid, the new clone contains a blank value (`""` for scalars, `new Set()` for sets) for the specified parameter.

```javascript
var params = new HashParams("foreground", "background", "tags:set");
params.setHash("#foreground=blue;background=green;tags=a,b");
var newParams = params.without("foreground").without("tags");
// newParams.foreground === ""
// newParams.background === "green" (unchanged)
// newParams.tags is an empty Set
```

If `value` is also specified and `parameterName` refers to a `set`-type parameter, that value is removed from the set.

```javascript
var params = new HashParams("tags");
params.setHash("#tags=a,b");
var newParams = params.without("tags", "b");
// newParams.tags is a Set containing the value "a"
```

### getHash()

The `getHash` method turns `values` back into a hash string.

The hash string is canonicalized, meaning if you had the same values in the `HashParams` (even if you added them in a different order), `getHash` will return the same string. Parameters are listed in the same order their names were originally passed to the constructor; `set`s list their values in sorted order; empty parameters are omitted.

```javascript
var params = new HashParams("foreground", "background", "highlight");
params.values = {background: "green", foreground: "blue", highlight: ""};
expect(params.getHash()).toBe("#foreground=blue;background=green");

var params2 = new HashParams("tags:set");
params2.values.tags.add("b");
params2.values.tags.add("a");
expect(params2.getHash()).toBe("#tags=a,b");
```

## Editing the code

If you want to hack on the code, you'll need to install [Node.js + npm](https://nodejs.org/) and karma-cli (`npm install -g karma-cli`). You'll also need [Python](https://www.python.org/) 2.7 (*not* version 3 or later, because for some ungodly reason the Karma test runner chooses to depend on technology that was obsolete back in 2008).

Then fork the HashParams repository, check out, and run:

    npm install

You can start the tests with:

    npm test

## Roadmap

* Possible future features (ones I don't actually need, but may implement anyway):
    * Support query strings as well as hashes.
    * Parameters of type `array`.
    * Parameters of type `number` (e.g. `#volume=11` would result in `values.volume = 11` as a number, rather than as a string). Likely constructor syntax: `new HashParams("volume:number"`).
    * Combined types, e.g. `tabStops:set<number>`.
    * Wildcards (probably via regular expressions), e.g. `new HashParams.types.scalar(/.*/)`.
    * Maybe routing? `new HashParams("/products/:id:number", "foreground")` + `params.setHash("/products/5;foreground=green")` could yield `params.values = {id: 5, foreground: "green"}`. You'd also need a way to name the routes so `values` could tell you which route it matched. Suggestions welcome.

If you want something from the "possible future features" list, or something else not listed here, feel free to write up an issue, along with any details about how you'd like to use it. (Or better yet, send a pull request.)

## Release history

* 0.2.0: Added the `set` type and the `without` method.
* 0.1.0: First release. Scalar string values only. `setHash`, `with`, and `getHash` methods.

## License

[MIT license](https://opensource.org/licenses/MIT)
