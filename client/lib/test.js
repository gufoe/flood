"use strict";

{
    importScripts('lib/util.js')
    importScripts('lib/Dna.js')
    importScripts('lib/World.js')
}


var _begin = (args, onfinish) => {
    var start_time = new Date

    // Client
    var _pool = [],
        _best = null,
        _cycles = 0,
        _args = args

    for (var i in args.pool)
        _pool.push(Dna.unserialize(args.pool[i]))

    var done = (best) => {

        if (!_best || best.score() > _best.score()) {
            _best = best
        }

        // console.log('updated', best.score())
        if (++_cycles > (_args.draw ? 1 : 10)) {
            console.log('done in', ((new Date).getTime() - start_time.getTime()) / 1000, 'seconds, best scored', _best.score())
            onfinish(_best)
        } else
            start()
    }

    var start = () => {
        var w = new World()
        w.init(_pool, {
            w: 20,
            h: 14,
            draw: _args.draw,
            rounds: 300
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

        var millis = _args.draw ? 1000 / _args.draw.fps : 0
        var int = setInterval(() => {
            for (var i = 0; i < (millis ? 1 : 15); i++) {
                if (!update()) {
                    clearInterval(int)
                    return
                }
            }
        }, 1000 / millis)
    }

    start()
}

var _init = (_args) => {
    var _client = _args.client,
        _draw = _args.draw

    _client.pull((subjects) => {
        for (var i in subjects) {
            var dna = null
            try {
                dna = Dna.unserialize(JSON.parse(subjects[i]))
            } catch (e) {
                console.error('Cannot unserialize dna.', subjects[i])
            } finally {
                if (!dna)
                    dna = Dna.gen()
            }
            subjects[i] = dna
        }
        _begin({
            pool: subjects,
            draw: _args.draw,
        }, (best) => {
            _client.push(best.score(), best)
            _init(_args)
        })
    })
}