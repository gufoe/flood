"use strict";

{
    importScripts("lib/Net.js")
}

(function() {
    var Dna = this.Dna = function() {
        var _start = null,
            _world = null,
            _player = null,
            _id = null,
            _explored = {},
            _params = {
                version: 300,
                idle: -.01,
                exploration: .01,
                code: 1,
            }

        this.mutate = () => {
            this.n_main = this.n_main.clone(.07)
            this.n_cell = this.n_cell.clone(.07)
            this.n_type = this.n_type.clone(.07)
            return this
        }
        this.crossover = (mate) => {
            this.n_main = new Net(this.n_main, mate.n_main, .1)
            this.n_cell = new Net(this.n_cell, mate.n_cell, .1)
            this.n_type = new Net(this.n_type, mate.n_type, .1)
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

        this.finalize = () => {
            //this.fitness+= 2*Object.keys(_explored).length
            this.fitness = Math.max(this.fitness, 0)
            this.fitness += _params.version
        }

        this.incFitness = () => {
            this.fitness++
        }

        this.update = () => {
            var diff = 0
            var i_main = []


            for (var dist = 1; dist <= Dna.dist; dist++) {
                var coords = [
                    [_player.x - dist, _player.y],
                    [_player.x + dist, _player.y],
                    [_player.x, _player.y + dist],
                    [_player.x, _player.y - dist],
                ]

                var i_cell = []

                for (var i in coords) {
                    var x = coords[i][0]
                    var y = coords[i][1]


                    // Inputs: [empty, inaccessible, self, others, code, enemy, weapon]
                    var i_type = [
                        _world.isWall(x, y) ? 1 : 0,
                        //    _world.isEmpty(x, y) ? 1 : 0,
                        //    _world.search(x, y, _id) ? 1 : 0,
                        //    _world.search(x, y, 1 - _id) ? 1 : 0,
                        _world.search(x, y, Dna.c.code) ? 1 : 0,
                        //    _world.search(x, y, Dna.c.enemy) ? 1 : 0,
                        //    _world.search(x, y, Dna.c.weapon) ? 1 : 0,
                        //     10 * (_player.x-x) / _world.w,
                        //     10 * (_player.y-y) / _world.h,
                    ]

                    var o_type = this.n_type.process(i_type)
                    i_cell.push(o_type[0])
                }
                var o_cell = this.n_cell.process(i_cell)
                i_main.push(o_cell[0])

                // Cells output + round
            }
            i_main.push(_world.round / _world.rounds * 3)
            var guess = this.n_main.process(i_main)

            var move = [
                [0, 0],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ]
            var max = 0
                /*
                            for (var i in guess) {
                                if (guess[i] > guess[max])
                                    max = i
                            }
                */
            var orig = guess[0]
            guess[0] = guess[0] * 2 - 1
            guess[0] = Math.max(guess[0], -.4999)
            guess[0] = Math.min(guess[0], +.4999)
            guess[0] += .5

            max = parseInt(1 + guess[0] * 4)
            if (max < 0 || max > 4)
                console.log(max, orig, guess[0])
                //	    if (guess[0] > .5)
                //		max = guess[1] < .5 ? 1 : 2
                //	    else
                //		max = guess[2] < .5 ? 3 : 4

            move = move[max]
            if (max != 0 && !_world.isWall(_player.x + move[0], _player.y + move[1])) {
                _world.move(_player, _player.x + move[0], _player.y + move[1])
                    // this.fitness+= _world.round/_world.rounds * .01
            } else {
                this.fitness += _params.idle
            }

            if (!_explored[_player.x + _world.w * _player.y]) {
                this.fitness += _params.exploration
                _explored[_player.x + _world.w * _player.y] = true
            }

            var code = _world.search(_player.x, _player.y, Dna.c.code)
            if (code) {
                this.fitness += _params.code
                _world.remove(code)
            }

            return move
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

    Dna.dist = 2
    Dna.gen = () => {
        var dna = new Dna()

        // Cells output + round
        dna.n_main = new Net([Dna.dist + 1, 4, 1])

        // Inputs: [wall, code]
        dna.n_cell = new Net([4, 5, 2, 1])

        // Inputs: [empty, inaccessible, self, others, code, enemy, weapon]
        dna.n_type = new Net([2, 3, 2, 1])

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

}).call(this)