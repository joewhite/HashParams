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
