describe 'HashParams', ->
    describe 'when constructed with', ->
        describe 'nothing', ->
            params = null
            beforeEach ->
                params = new HashParams()
            it 'has no values', ->
                expect(params.values).toEqual {}
        describe 'foreground and background', ->
            params = null
            beforeEach ->
                params = new HashParams(
                    new HashParams.scalar('foreground'),
                    new HashParams.scalar('background'))
            it 'has empty strings for values.foreground and values.background', ->
                expect(params.values).toEqual {foreground: '', background: ''}
    describe '.setHash()', ->
        describe 'when constructed with foreground and background', ->
            params = null
            beforeEach ->
                params = new HashParams(
                    new HashParams.scalar('foreground'),
                    new HashParams.scalar('background'))
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
        describe 'unescaping', ->
            decodes = (encoded, decoded) ->
                params = new HashParams(new HashParams.scalar('name' + decoded))
                params.setHash '#name' + encoded + '=value' + encoded
                expected = {}
                expected['name' + decoded] = 'value' + decoded
                expect(params.values).toEqual expected
            accepts = (char) -> decodes char, char
            it 'decodes space', -> decodes '%20', ' '
            it 'decodes =', -> decodes '%3D', '='
            it 'accepts !', -> accepts '!'
            it 'accepts &', -> accepts '&'
    describe '.with()', ->
        describe 'starting with foreground=blue and background=green', ->
            params = null
            beforeEach ->
                params = new HashParams(
                    new HashParams.scalar('foreground'),
                    new HashParams.scalar('background'))
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
                params = new HashParams(
                    new HashParams.scalar('foreground'),
                    new HashParams.scalar('background'))
            it 'with no values set', ->
                expect(params.getHash()).toBe '#'
            it 'with one value set', ->
                params.values.foreground = 'blue'
                expect(params.getHash()).toBe '#foreground=blue'
            it 'with both values set', ->
                params.values = {foreground: 'blue', background: 'green'}
                expect(params.getHash()).toBe '#foreground=blue;background=green'
