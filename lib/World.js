"use strict";

if (typeof require != 'undefined') {
    var util = require('./util.js')
    var Dna = require('./Dna.js')
}

(function() {
    var World = function() {
        var u = 30
        var objects = this.objects = []
        this.round = 1

        this.init = (pool, options) => {
            this.players = []
            this.w = options.w
            this.h = options.h
            this.map = this.parseField(options.field)
            this.rounds = options.rounds

            // Generate pool
            this.pool = [
                util.pick(pool).clone(),
                util.pick(pool).clone(),
            ]

            // Mix pool if required
            if (options.mix) {
                for (var i in this.pool) {
                    this.pool[i].crossover(util.pick(pool))
                }
            }

            // Add players in random positions
            for (var i in this.pool) {
                var obj = this.spawn(i)
                this.pool[i].setup(this, obj)
            }

            // Setup canvas
            if (options.draw) {
                this.draw = true
            }
        }

        this.destroy = () => {}

        // Update the game
        this.update = () => {

            for (var i in this.pool) {
                var move = this.pool[i].update(this, i + '')
            }


            if (this.round%8 == 0 && this.objects.length < 20) {
                this.spawn(Dna.c.code)
            }

            this.draw && postMessage({
                draw: true,
                width: this.w*u,
                height: this.h*u,
                ops: this.ctxOps()
            })

            this.round++
        }

        // Returns whether the world is ended
        this.finished = () => {
            return this.round >= this.rounds
        }

        // Returns the best dna
        this.best = () => {
            return this.pool[util.max(this.pool, 'score')]
        }


        this.ctxOps = () => {
            var ops = []

            var Op = function(op, params) {
                this.op = op
                this.params = params
            }

            ops.push(new Op('clearRect', [0, 0, this.w * u, this.h * u]))
            for (var x = 0; x < this.w; x++) {
                for (var y = 0; y < this.h; y++) {
                    var color
                    this.isEmpty(x, y) && (color = '#11a')
                    if (this.isWall(x, y))
                        color = '#262626'
                    else
                        color = '#111'
                    ops.push(new Op('fillStyle', color))
                    ops.push(new Op('fillRect', [x * u, y * u, u, u]))
                }
            }

            for (var i in objects) {
                var obj = objects[i]
                var color
                obj.type == Dna.c.enemy && (color = 'rgba(255, 0, 0, .7)')
                obj.type == Dna.c.code && (color = 'rgba(255, 255, 0, .7)')
                obj.type == Dna.c.pl0 && (color = 'rgba(150, 0, 255, .7)')
                obj.type == Dna.c.pl1 && (color = 'rgba(0, 100, 255, .7)')
                ops.push(new Op('fillStyle', color))
                ops.push(new Op('fillRect', [obj.x * u + u / 4, obj.y * u + u / 4, u / 2, u / 2]))
            }

            return ops
        }

        this.parseField = (str) => {
            var f = str.split(',')
            for (var i in f)
                f[i] = f[i] == '.' ? [] : null
            return f
        }

        this.check = (x, y) => {
            return !(x < 0 || y < 0 || x >= this.w || y >= this.h)
        }

        this.isWall = (x, y) => {
            return !this.check(x, y) || this.map[x + this.w * y] === null
        }

        this.isEmpty = (x, y) => {
            return this.check(x, y) && !this.isWall(x, y) && !this.map[x + this.w * y].length
        }

        this.spawn = (type) => {
            var x, y
            do {
                x = parseInt(Math.random() * this.w)
                y = parseInt(Math.random() * this.h)
            } while (!this.isEmpty(x, y))
            var obj = {
                x: x, y: y, type: type
            }
            this.append(obj)
            return obj
        }

        this.remove = (obj) => {
            util.remove(this.map[obj.x + this.w * obj.y], obj)
            util.remove(this.objects, obj)
        }

        this.append = (obj) => {
            this.objects.push(obj)
            this.map[obj.x + this.w * obj.y].push(obj)
        }

        this.move = (obj, x, y) => {
            this.remove(obj)
            obj.x = x
            obj.y = y
            this.append(obj)
        }

        this.search = (x, y, type) => {
            var arr = this.map[x + this.w * y]
            for (var i in arr) {
                if (arr[i].type == type)
                    return arr[i]
            }
        }

    }

    if (util.module())
        module.exports = World
    else
        util.exports(this).World = World

}).call(this)
