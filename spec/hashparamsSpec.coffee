#region Set helpers
setOf = (values...) ->
    result = new Set
    values.forEach (value) -> result.add value
    result
Set.prototype.jasmineToString = ->
    # CoffeeScript list comprehensions don't work on Set because it has
    # a .size property, not .length. Manually arrayify.
    values = []
    @forEach (value) -> values.push value
    "Set{#{values.join(', ')}}"
beforeEach ->
    jasmine.addCustomEqualityTester (a, b) ->
        if (a instanceof Set && b instanceof Set)
            if (a.size == b.size)
                clone = new Set
                a.forEach (value) -> clone.add value
                b.forEach (value) -> clone.delete value
                clone.size == 0
            else false # suppress Jasmine's default "all Set instances are equal" behavior
#endregion

describe 'Set comparison', ->
    it 'works', ->
        s = setOf 5, 4
        expect(s).toEqual setOf 4, 5

describe 'HashParams', ->
    describe 'when constructed with', ->
        describe 'nothing', ->
            params = null
            beforeEach ->
                params = new HashParams()
            it 'has no values', ->
                expect(params.values).toEqual {}
        describe 'foreground and background as', ->
            describe 'scalars', ->
                params = null
                beforeEach ->
                    params = new HashParams(
                        new HashParams.types.scalar('foreground'),
                        new HashParams.types.scalar('background'))
                it 'has empty strings for values.foreground and values.background', ->
                    expect(params.values).toEqual {foreground: '', background: ''}
            describe 'strings', ->
                params = null
                beforeEach ->
                    params = new HashParams('foreground', 'background')
                it 'has empty strings for values.foreground and values.background', ->
                    expect(params.values).toEqual {foreground: '', background: ''}
            describe 'array of scalars', ->
                params = null
                beforeEach ->
                    params = new HashParams([
                        new HashParams.types.scalar('foreground'),
                        new HashParams.types.scalar('background')
                    ])
                it 'has empty strings for values.foreground and values.background', ->
                    expect(params.values).toEqual {foreground: '', background: ''}
        describe 'invalid value', ->
            expectInvalidParameter = (value) ->
                expect(-> new HashParams(value)).toThrowError /Invalid parameter definition/
            it 'undefined', -> expectInvalidParameter undefined
            it 'null', -> expectInvalidParameter null
            it 'empty object', -> expectInvalidParameter {}
    describe '.setHash()', ->
        describe 'when constructed with foreground and background', ->
            params = null
            beforeEach ->
                params = new HashParams('foreground', 'background')
            describe 'resets to empty', ->
                beforeEach -> params.values = {foreground: 'blue', background: 'green'}
                it 'when passed just a hash character', ->
                    params.setHash '#'
                    expect(params.values).toEqual {foreground: '', background: ''}
                it 'when passed an empty string', ->
                    params.setHash ''
                    expect(params.values).toEqual {foreground: '', background: ''}
                it 'when passed undefined', ->
                    params.setHash undefined
                    expect(params.values).toEqual {foreground: '', background: ''}
                it 'when passed null', ->
                    params.setHash null
                    expect(params.values).toEqual {foreground: '', background: ''}
            it 'can set values.foreground', ->
                params.setHash '#foreground=blue'
                expect(params.values).toEqual {foreground: 'blue', background: ''}
            it 'can set values.background', ->
                params.setHash '#background=green'
                expect(params.values).toEqual {foreground: '', background: 'green'}
            it 'clears other values', ->
                params.values.foreground = 'magenta'
                params.setHash '#background=green'
                expect(params.values).toEqual {foreground: '', background: 'green'}
            it 'can set both foreground and background', ->
                params.setHash '#foreground=blue;background=green'
                expect(params.values).toEqual {foreground: 'blue', background: 'green'}
            it 'will not set values.foo', ->
                params.setHash '#foo=bar'
                expect(params.values).toEqual {foreground: '', background: ''}
        describe 'unencoding', ->
            decodes = (encoded, decoded) ->
                params = new HashParams('name' + decoded)
                params.setHash '#name' + encoded + '=value' + encoded
                expected = {}
                expected['name' + decoded] = 'value' + decoded
                expect(params.values).toEqual expected
            accepts = (char) -> decodes char, char
            it 'decodes space', -> decodes '%20', ' '
            it 'decodes =', -> decodes '%3D', '='
            it 'accepts !', -> accepts '!'
            it 'accepts $', -> accepts '$'
            it 'accepts &', -> accepts '&'
    describe '.with()', ->
        describe 'starting with foreground=blue and background=green', ->
            params = null
            beforeEach ->
                params = new HashParams('foreground', 'background')
                params.values.foreground = 'blue'
                params.values.background = 'green'
            it 'can set background=red', ->
                newParams = params.with('background', 'red')
                expect(newParams.values).toEqual {foreground: 'blue', background: 'red'}
            it 'does not modify original', ->
                newParams = params.with('background', 'red')
                expect(params.values).toEqual {foreground: 'blue', background: 'green'}
            it 'will not set values.foo', ->
                newParams = params.with('foo', 'bar')
                expect(newParams.values).toEqual {foreground: 'blue', background: 'green'}
    describe '.getHash()', ->
        describe 'when constructed with foreground and background', ->
            params = null
            beforeEach ->
                params = new HashParams('foreground', 'background')
            it 'with no values set', ->
                expect(params.getHash()).toBe '#'
            it 'with one value set', ->
                params.values.foreground = 'blue'
                expect(params.getHash()).toBe '#foreground=blue'
            it 'with both values set', ->
                params.values = {foreground: 'blue', background: 'green'}
                expect(params.getHash()).toBe '#foreground=blue;background=green'
            it 'with one value missing', ->
                params.values = {foreground: 'blue'}
                expect(params.getHash()).toBe "#foreground=blue"
            it 'with undefined for one value', ->
                params.values = {foreground: 'blue', background: undefined}
                expect(params.getHash()).toBe "#foreground=blue"
            it 'with null for one value', ->
                params.values = {foreground: 'blue', background: null}
                expect(params.getHash()).toBe "#foreground=blue"
        describe 'encoding', ->
            encodes = (decoded, encoded) ->
                params = new HashParams('name' + decoded)
                params.values['name' + decoded] = 'value' + decoded
                expect(params.getHash()).toBe '#name' + encoded + '=value' + encoded
            accepts = (char) -> encodes char, char
            it 'encodes \\0', -> encodes '\0', '%00'
            it 'encodes \\n', -> encodes '\n', '%0A'
            it 'encodes space', -> encodes ' ', '%20'
            it 'accepts !', -> accepts '!'
            it 'encodes "', -> encodes '"', '%22'
            it 'encodes #', -> encodes '#', '%23'
            it 'accepts $', -> accepts '$'
            it 'encodes %', -> encodes '%', '%25'
            it 'accepts &', -> accepts '&'
            it 'accepts \'', -> accepts '\''
            it 'accepts (', -> accepts '('
            it 'accepts )', -> accepts ')'
            it 'accepts *', -> accepts '*'
            it 'accepts +', -> accepts '+'
            it 'encodes ,', -> encodes ',', '%2C'
            it 'accepts -', -> accepts '-'
            it 'accepts .', -> accepts '.'
            it 'accepts /', -> accepts '/'
            it 'accepts 0', -> accepts '0'
            it 'accepts 9', -> accepts '9'
            it 'accepts :', -> accepts ':'
            it 'encodes ;', -> encodes ';', '%3B'
            it 'encodes <', -> encodes '<', '%3C'
            it 'encodes =', -> encodes '=', '%3D'
            it 'encodes >', -> encodes '>', '%3E'
            it 'accepts ?', -> accepts '?'
            it 'accepts @', -> accepts '@'
            it 'accepts A', -> accepts 'A'
            it 'accepts Z', -> accepts 'Z'
            it 'encodes [', -> encodes '[', '%5B'
            it 'encodes \\', -> encodes '\\', '%5C'
            it 'encodes ]', -> encodes ']', '%5D'
            it 'encodes ^', -> encodes '^', '%5E'
            it 'accepts _', -> accepts '_'
            it 'encodes `', -> encodes '`', '%60'
            it 'accepts a', -> accepts 'a'
            it 'accepts z', -> accepts 'z'
            it 'encodes {', -> encodes '{', '%7B'
            it 'encodes |', -> encodes '|', '%7C'
            it 'encodes }', -> encodes '}', '%7D'
            it 'accepts ~', -> accepts '~'
            it 'encodes ©', -> encodes '©', '%C2%A9'
            it 'encodes ▶', -> encodes '▶', '%E2%96%B6'
            it 'encodes multiple characters', -> encodes ' |', '%20%7C'
