"use strict";

if (typeof require != 'undefined') {
    var util = require('./util.js')
    var Net = require('./Net.js')
}

(function() {
    var Dna = function() {
        var _start = null,
            _world = null,
            _player = null,
            _id = null

        this.mutate = () => {
            this.n_main = this.n_main.clone(.07)
            this.n_cell = this.n_cell.clone(.07)
            this.n_type = this.n_type.clone(.07)
            return this
        }
        this.crossover = (mate) => {
            this.n_main = new Net(this.n_main, mate.n_main, .07)
            this.n_cell = new Net(this.n_cell, mate.n_cell, .07)
            this.n_type = new Net(this.n_type, mate.n_type, .07)
            return this
        }

        this.clone = () => {
            var dna = new Dna()
            dna.n_main = this.n_main.clone()
            dna.n_cell = this.n_cell.clone()
            dna.n_type = this.n_type.clone()
            return dna
        }

        this.score = () => {
            return this.fitness
        }

        this.incFitness = () => {
            this.fitness++
        }

        this.update = () => {
            var diff = 0
            var i_main = []


            for (var y = _player.y - 2; y <= _player.y + 2; y++) {
                for (var x = _player.x - 2; x <= _player.x + 2; x++) {


                    // Inputs: [empty, inaccessible, self, others, code, enemy, weapon]
                    // var i_type = [
                    //     _world.isWall(x, y) ? 1 : 0,
                    //     _world.isEmpty(x, y) ? 1 : 0,
                    //     _world.search(x, y, _id) ? 1 : 0,
                    //     _world.search(x, y, 1 - _id) ? 1 : 0,
                    //     _world.search(x, y, Dna.c.code) ? 1 : 0,
                    //     _world.search(x, y, Dna.c.enemy) ? 1 : 0,
                    //     _world.search(x, y, Dna.c.weapon) ? 1 : 0,
                    // ]
                    //
                    // var o_type = this.n_type.process(i_type)

                    // Inputs: [relx, rely, type]
                    var i_cell = [
                        // (_player.x-x) / _world.w,
                        // (_player.y-y) / _world.h,
                        _world.isWall(x, y) ? 1 : 0,
                        _world.search(x, y, Dna.c.code) ? 1 : 0,
                    ]
                    var o_cell = this.n_cell.process(i_cell)
                    i_main.push(o_cell[0])
                }
            }

            // Cells output + round
            i_main.push(0)
            var guess = this.n_main.process(i_main)

            var move = [
                [0, 0],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ]
            var max = 0
            for (var i in guess) {
                if (_world.isWall(_player.x + move[i][0], _player.y + move[i][1]))
                    continue
                if (guess[i] > guess[max])
                    max = i
            }

            move = move[max]
            if (!_world.isWall(_player.x + move[0], _player.y + move[1])) {
                _world.move(_player, _player.x + move[0], _player.y + move[1])
            }

            var code = _world.search(_player.x, _player.y, Dna.c.code)
            if (code) {
                this.fitness++
                    _world.remove(code)
            }

            return move[max]
        }

        this.setup = (world, obj) => {
            _world = world
            _id = obj.type
            _player = obj
            this.fitness = 0
            _start = {
                x: _player.x,
                y: _player.y
            }
        }
    }

    Dna.c = {
        empty: '.',
        enemy: 'E',
        weapon: 'W',
        code: 'C',
        pl0: '0',
        pl1: '1',
        inaccessible: 'x',
    }

    Dna.gen = () => {
        var dna = new Dna()

        // Cells output + round
        dna.n_main = new Net([25+1, 3, 2, 2, 5])

        // Inputs: [wall, code]
        dna.n_cell = new Net([2, 3, 2, 1])

        // Inputs: [empty, inaccessible, self, others, code, enemy, weapon]
        dna.n_type = new Net([7, 5, 1])

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
        dna.n_main = Net.unserialize(data.n_main)
        dna.n_cell = Net.unserialize(data.n_cell)
        dna.n_type = Net.unserialize(data.n_type)
        dna.fitness = data.fitness
        return dna
    }

    if (util.module())
        module.exports = Dna
    else
        util.exports(this).Dna = Dna

}).call(this)