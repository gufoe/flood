"use strict";

if (typeof require != 'undefined') {
    var util = require('./util.js')
    var Net = require('./Net.js')
}

(function() {
    var Dna = function() {
        this.mutate = () => {
            this.net = this.net.clone(.1)
            return this
        }

        this.clone = () => {
            var dna = new Dna()
            dna.net = this.net.clone()
            return dna
        }

        this.score = () => {
            return this.fitness
        }

        this.update = () => {

            var inputs = [
                [0, 0],
                [0, 1],
                [1, 0],
                [1, 1],
            ]
            var outputs = [
                [0],
                [1],
                [1],
                [0],
            ]

            var diff = 0
            for (var i in inputs) {
                var guess = this.net.process(inputs[i])
                for (var j in outputs[i]) {
                    diff += Math.abs(guess[j] - outputs[i][j])
                }
            }

            this.fitness = 1 - diff / 4
        }
    }

    Dna.gen = (conf) => {
        var dna = new Dna()
        dna.net = new Net(conf.net)
        return dna
    }

    Dna.test = (pool, done) => {
        var pool = []
        for (var i in dna) {
            (pool[i])
        }
        var test = new Test()
        test.on('complete', () => {
            done(test.best)
        })
    }

    Dna.unserialize = (data) => {
        var dna = new Dna()
        dna.net = Net.unserialize(data.net)
        return dna
    }


    if (util.module()) {
        module.exports = Dna
    } else {
        window.Dna = Dna
    }

}).call(this)