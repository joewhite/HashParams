# HashParams

HashParams is a JavaScript library that lets you treat a URL hash ([officially](https://tools.ietf.org/html/rfc3986#section-3.5) the "fragment identifier") as a set of named parameters. You can parse hash strings and build new ones.

```javascript
// User is on page.html#foreground=blue;background=green. We can parse the hash:
var params = new HashParams("foreground", "background");
params.setHash(window.location.hash);
// Now params.values is {foreground: "blue", background: "green"}.

// To build a hyperlink that changes foreground:
var newUrl = params.with("foreground", "red").getHash();
// newUrl is "#foreground=red;background=green"
```

HashParams is tested in the evergreen browsers (FireFox, Chrome, and IE 11). It may or may not work in older browsers.

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

The `HashParams` constructor takes a list of parameter names that your page expects. You can pass either strings or an array:

```javascript
new HashParams("foreground", "background")
new HashParams(["foreground", "background"])
```

Parameter names can contain any characters from the Unicode Basic Multilingual Plane (U+0000 through U+FFFF) except colon (`:`), asterisk (`*`), and slash (`/`), which are reserved for future use.

If you want, you can also pass instances of `HashParams.types.scalar`.

```javascript
new HashParams(new HashParams.types.scalar("foreground"))
```

The current version does not support wildcards; you need to explicitly list every parameter name your page will use.

### values

The `values` property contains the currently-parsed parameter values, as a JavaScript object.

When the `HashParams` instance is first created, `values` contains an empty string for each parameter:

```javascript
var params = new HashParams("foreground", "background");
expect(params.values).toEqual({foreground: "", background: ""});
```

You can modify `values`, though in many cases it's better to use the `with` method (see below).

### setHash(hashString)

The `setHash` method takes a string of the form `#name1=value1;name2=value2` and parses its values into the `values` property.

```javascript
var params = new HashParams("foreground", "background");
params.setHash("#foreground=blue;background=green");
expect(params.values).toEqual({foreground: "blue", background: "green"});
```

Typically you would pass `window.location.hash` as the value.

The hash string can contain any characters from the Unicode Basic Multilingual Plane (U+0000 through U+FFFF), but probably won't work with surrogate pairs.

To ensure proper behavior as you navigate backwards and forwards through browser history, `setHash` clears any parameter values that are not included in the hash string:

```javascript
var params = new HashParams("foreground", "background");
params.setHash("#foreground=blue;background=green");
// Then later:
params.setHash("#foreground=red");
// Now values.background has been reset to ""
expect(params.values).toEqual({foreground: "red", background: ""});
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

### getHash()

The `getHash` method turns `values` back into a hash string.

Parameters are always listed in a deterministic order; specifically, the same order their names were originally passed to the constructor. Parameters whose values are empty strings are omitted.

```javascript
var params = new HashParams("foreground", "background", "highlight");
params.values = {background: "green", foreground: "blue", highlight: ""};
expect(params.getHash()).toBe("#foreground=blue;background=green");
```

## Editing the code

If you want to hack on the code, you'll need to install [Node.js + npm](https://nodejs.org/) and karma-cli (`npm install -g karma-cli`). You'll also need [Python](https://www.python.org/) 2.7 (*not* version 3 or later, because for some ungodly reason the Karma test runner chooses to depend on technology that was obsolete back in 2008).

Then fork the HashParams repository, check out, and run:

    npm install

You can start the tests with:

    npm test

## Roadmap

* Features likely to be added in the near future (because I need them for a project):
    * Parameters of type `sortedArray` (e.g., `#tags=b,a` would result in `values.tags = ["a", "b"]`). Likely constructor syntax: `new HashParams("tags:sortedArray")`.
* Possible future features (ones I don't actually need, but may implement anyway):
    * Support query strings as well as hashes.
    * Parameters of type `array`.
    * Parameters of type `number` (e.g. `#volume=11` would result in `values.volume = 11` as a number, rather than as a string). Likely constructor syntax: `new HashParams("volume:number"`).
    * Combined types, e.g. `tabStops:sortedArray<number>`.
    * Wildcards, e.g. `*:string`.
    * Regular expressions for parameter names?
    * Maybe routing? `new HashParams("/products/:id:number", "foreground")` + `params.setHash("/products/5;foreground=green")` could yield `params.values = {id: 5, foreground: "green"}`. You'd also need a way to name the routes so `values` could tell you which route it matched. Suggestions welcome.

If you want something from the "possible future features" list, or something else not listed here, feel free to write up an issue, along with any details about how you'd like to use it. (Or better yet, send a pull request.)

## Release history

* 0.1.0: First release. Scalar string values only. `setHash`, `with`, and `getHash` methods.

## License

MIT
