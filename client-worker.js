importScripts('lib/util.js')
importScripts('lib/Net.js')
importScripts('lib/Dna.js')
importScripts('lib/World.js')
importScripts('lib/flood.js')


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
        if (++_cycles > 100) {
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
            rounds: 200
        })

        while (true) {
            if (!w.finished()) {
                w.update()
            } else {
                w.destroy()
                setTimeout(() => {
                    done(w.best())
                })
                break
            }
        }
    }

    start()
}

var flood = new Flood({
    primero: test_primero
})
flood.on('close', () => {
    console.log('Lost connection')
    postMessage({reload: true})
})

onmessage = (e) => {
    var server = e.data
    flood.start(server)
}
