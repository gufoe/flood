"use strict";

var WebSocketServer = require('uws').Server
var cli = require('terminal-kit').terminal;
var fs = require('fs')
var util = require('./lib/util.js')
var World = require('./lib/World.js')
var Dna = require('./lib/Dna.js')
var argv = require('minimist')(process.argv.slice(2));

var _ = {
    conf: {
        ssl: argv.ssl,
        ssl_files: {
            prv: 'cert/privkey.pem',
            crt: 'cert/cert.pem',
        },
        wss: {
            port: 9666
        },

        pop: {
            size: 1000,
        },
    }
}

var Client = function(server, ws) {
    var self = this
    this.server = server
    this.ws = ws
    this.first_seen = new Date()
    this.last_seen = new Date()

    this.send = (type, args) => {
        this.ws.send(JSON.stringify({
            type: type,
            args: args,
        }))
    }

    this.dispatch = (data, done) => {
        var now = new Date()
        this.server.time += now.getTime() - this.last_seen.getTime()
        this.last_seen = now

        switch (data.type) {
            case 'res':
                _.pop.insert(data.args)

            case 'next':
                this.send('test', {
                    test: 'primero',
                    pool: [
                        _.pop.next(),
                        _.pop.next(),
                        _.pop.next(),
                    ]
                })
                break
        }
    }

    this.ws.on('message', data => {
        this.dispatch(JSON.parse(data))
    })

    this.ws.on('close', () => {
        util.remove(this.server.clients, this)
    })
}

var Server = function() {
    var self = this
    this.clients = []
    this.time = 0

    if (_.conf.ssl) {
        console.log('Enabling ssl')
        var credentials = {
            key: fs.readFileSync(_.conf.ssl_files.prv, 'utf8'),
            cert: fs.readFileSync(_.conf.ssl_files.crt, 'utf8')
        }

        this.express = require('express')()
        this.serv = require('https').createServer(credentials, this.express)
        this.serv.listen(_.conf.wss.port)
        _.conf.wss.server = this.serv
        _.conf.wss.port = undefined
    }

    this.wss = new WebSocketServer(_.conf.wss)
    this.wss.on('connection', function(ws) {
        self.clients.push(new Client(self, ws))
    })

    setInterval(() => {
        var stats = {
            workers: _.server.clients.length,
            time: _.server.time,
            generation: _.pop.tested,
            best: _.pop.best().score,
        }
        for (var i in this.clients)
            this.clients[i].send('stats', stats)
    }, 5000)
}

var Pop = function(size) {
    var self = this
    this.size = size
    this.population = []
    this.next_id = 1
    this.tested = 0
    this._best = 0
    this._worst = 0

    for (var i = 0; i < this.size; i++) {
        this.population.push({
            id: this.next_id++,
            dna: Dna.gen(),
            score: 0
        })
    }


    this.next = () => {
        if (Math.random() < .5)
            return this.best().dna
        else
            return this.population[Math.floor(Math.random() * this.size)].dna
    }

    this.worst = (replacement) => {
        if (replacement) {
            this.population[this._worst] = replacement
            this._worst = util.min(this.population, 'score')
            this._best = util.max(this.population, 'score')
        }
        return this.population[this._worst]
    }

    this.best = (replacement) => {
        if (replacement) {
            this.population[this._best] = replacement
            this._worst = util.min(this.population, 'score')
            this._best = util.max(this.population, 'score')
        }
        return this.population[this._best]
    }

    this.insert = (dna) => {
        this.tested++

        // REVIEW: Shouldn't trust who sent the result
        var dna = Dna.unserialize(dna)
        cli.red(dna.score() + '\t')

        var subject = {
            id: this.next_id++,
            dna: dna,
            score: dna.score()
        }

        if (subject.score > this.worst().score) {
            this.worst(subject)
        }
    }
}


var init = () => {
    _.server = new Server()
    _.pop = new Pop(_.conf.pop.size)

    setInterval(() => {
        cli.clear()

        cli.green('Workers: ')
        cli.blue('%d\n', _.server.clients.length)

        cli.green('Best:    ')
        cli.blue('%f\n', parseFloat(_.pop.best() ? _.pop.best().score : 0))

        cli.green('Worst:    ')
        cli.blue('%f\n', parseFloat(_.pop.worst() ? _.pop.worst().score : 0))

        cli.green('Tested:  ')
        cli.blue('%d\n', _.pop.tested)

        cli.moveTo(1, 6)
    }, 500)
}

init()