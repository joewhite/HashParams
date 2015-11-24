describe 'HashParams', ->
    describe 'given foreground and background', ->
        params = null
        beforeEach ->
            params = new HashParams(
                new HashParams.scalar('foreground'),
                new HashParams.scalar('background'))
        it 'initializes values.foreground and .background', ->
            expect(params.values).toEqual {foreground: '', background: ''}
        describe 'setHash', ->
            it 'can set values.foreground', ->
                params.setHash '#foreground=blue'
                expect(params.values).toEqual {foreground: 'blue', background: ''}
            it 'can set values.background', ->
                params.setHash '#background=green'
                expect(params.values).toEqual {foreground: '', background: 'green'}
            xit 'will not set values.foo', ->
                params.setHash '#foo=bar'
                expect(params.values).toEqual {foreground: '', background: ''}