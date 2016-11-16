importScripts('lib/util.js')
importScripts('lib/Net.js')
importScripts('lib/Dna.js')
importScripts('lib/World.js')
importScripts('lib/flood.js')

var _args = {}

var test_primero = (args, callback) => {
    // Client
    var _pool = [],
        _best = null,
        _cycles = 0

    for (var i in args.pool)
        _pool.push(Dna.unserialize(args.pool[i]))

    var done = (best) => {

        if (!_best || best.score() > _best.score()) {
            _best = best
        }
        // console.log('updated', best.score())
        if (++_cycles > 20) {
            console.log('done, best scored', _best.score())
            callback(_best)
        } else
            start()
    }

    var start = () => {
        var w = new World()
        w.init(_pool, {
            mix: 2,
            field: '.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,x,x,x,x,x,.,x,x,x,x,x,x,.,x,x,x,x,x,.,.,x,.,.,.,.,.,x,x,x,x,x,x,.,.,.,.,.,x,.,.,x,.,x,x,x,.,.,.,x,x,.,.,.,x,x,x,.,x,.,.,.,.,.,.,x,x,x,.,x,x,.,x,x,x,.,.,.,.,.,.,x,x,x,.,x,.,.,.,.,.,.,.,.,x,.,x,x,x,.,.,.,.,x,.,' +
                'x,.,x,x,x,x,x,x,.,x,.,x,.,.,.,x,x,.,x,.,.,.,x,x,x,x,x,x,.,.,.,x,.,x,x,.,.,.,x,x,x,.,x,x,x,x,x,x,.,x,x,x,.,.,.,.,x,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,x,.,.,x,x,x,.,x,x,x,x,x,x,x,x,x,x,.,x,x,x,.,.,x,x,x,.,.,.,.,.,.,.,.,.,.,.,.,x,x,x,.,.,x,x,x,.,x,x,x,.,x,' +
                'x,.,x,x,x,.,x,x,x,.,.,.,.,.,.,.,.,.,.,x,x,.,.,.,.,.,.,.,.,.',
            w: 20,
            h: 14,
            draw: _args.draw,
            rounds: 1000
        })

        var update = () => {
            if (w.finished()) {
		for (var i in w.pool) {
			w.pool[i].finalize()
		}
		var best = w.best()
                w.destroy()
                done(best)
                return false
            } else {
                w.update()
                return true
            }
        }

        if (_args.draw) {
            console.log('Using setInterval to limit framerate')
            var int = setInterval(() => {
                if (!update()) {
                    clearInterval(int)
                }
            }, 1000/_args.draw.fps)
        } else {
            while (update());
        }
    }

    start()
}

var flood = new Flood({
    primero: test_primero
})
flood.on('close', () => {
    console.log('Lost connection')
    postMessage({
        reload: true
    })
})
onmessage = (e) => {
    _args = e.data
    flood.start(_args.server)
}
