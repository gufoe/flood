importScripts('lib/util.js')
importScripts('lib/Net.js')
importScripts('lib/Dna.js')
importScripts('lib/World.js')
importScripts('lib/flood.js')


var test_primero = (args, callback) => {
    // Client
    var pool = []
    for (var i in args.pool)
        pool.push(Dna.unserialize(args.pool[i]))

    var w = new World()
    w.init(pool, {
        mix: 2,
        field: '.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,x,x,x,x,x,.,x,x,x,x,x,x,.,x,x,x,x,x,.,.,x,.,.,.,.,.,x,x,x,x,x,x,.,.,.,.,.,x,.,.,x,.,x,x,x,.,.,.,x,x,.,.,.,x,x,x,.,x,.,.,.,.,.,.,x,x,x,.,x,x,.,x,x,x,.,.,.,.,.,.,x,x,x,.,x,.,.,.,.,.,.,.,.,x,.,x,x,x,.,.,.,.,x,.,' +
            'x,.,x,x,x,x,x,x,.,x,.,x,.,.,.,x,x,.,x,.,.,.,x,x,x,x,x,x,.,.,.,x,.,x,x,.,.,.,x,x,x,.,x,x,x,x,x,x,.,x,x,x,.,.,.,.,x,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,x,.,.,x,x,x,.,x,x,x,x,x,x,x,x,x,x,.,x,x,x,.,.,x,x,x,.,.,.,.,.,.,.,.,.,.,.,.,x,x,x,.,.,x,x,x,.,x,x,x,.,x,' +
            'x,.,x,x,x,.,x,x,x,.,.,.,.,.,.,.,.,.,.,x,x,.,.,.,.,.,.,.,.,.',
        w: 20,
        h: 14,
        rounds: 100
    })

    var done = () => {
        var best = w.best()
            // console.log('updated', best.score())
        callback(best)
    }

    while (true) {
        if (!w.finished()) {
            w.update()
        } else {
            console.log('done, best scored', w.best().score())
            w.destroy()
            done()
            break
        }
    }
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
