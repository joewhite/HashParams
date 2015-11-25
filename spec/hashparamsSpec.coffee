describe 'HashParams', ->
    describe 'initial state', ->
        describe 'given foreground and background', ->
            params = null
            beforeEach ->
                params = new HashParams(
                    new HashParams.scalar('foreground'),
                    new HashParams.scalar('background'))
            it 'has empty strings for values.foreground and values.background', ->
                expect(params.values).toEqual {foreground: '', background: ''}
    describe '.setHash()', ->
        describe 'given foreground and background', ->
            params = null
            beforeEach ->
                params = new HashParams(
                    new HashParams.scalar('foreground'),
                    new HashParams.scalar('background'))
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
            it 'will not set values.foo', ->
                params.setHash '#foo=bar'
                expect(params.values).toEqual {foreground: '', background: ''}
    describe '.with()', ->
        describe 'given foreground=blue and background=green', ->
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
