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
            if (options.canvas) {
                this.canvas = options.canvas
                this.canvas.width = this.w * u
                this.canvas.height = this.h * u
                this.ctx = this.canvas.getContext('2d')
            }
        }

        this.destroy = () => {}

        // Update the game
        this.update = () => {

            for (var i in this.pool) {
                var move = this.pool[i].update(this, i + '')
            }


            if (this.round%8 == 0) {
                this.spawn(Dna.c.code)
            }

            this.ctx && this.display()

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


        this.display = () => {
            this.ctx.clearRect(0, 0, this.w * u, this.h * u)
            for (var x = 0; x < this.w; x++) {
                for (var y = 0; y < this.h; y++) {
                    var color
                    this.isEmpty(x, y) && (color = '#11a')
                    if (this.isWall(x, y))
                        color = '#115'
                    else
                        color = '#11f'
                    this.ctx.fillStyle = color
                    this.ctx.fillRect(x * u, y * u, u, u)
                }
            }

            for (var i in objects) {
                var obj = objects[i]
                var color
                obj.type == Dna.c.enemy && (color = 'rgba(255, 0, 0, .8)')
                obj.type == Dna.c.code && (color = 'rgba(255, 255, 0, .8)')
                obj.type == Dna.c.pl0 && (color = 'rgba(255, 0, 255, .8)')
                obj.type == Dna.c.pl1 && (color = 'rgba(0, 255, 0, .8)')
                this.ctx.fillStyle = color
                this.ctx.fillRect(obj.x * u + u / 4, obj.y * u + u / 4, u / 2, u / 2)
            }
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

    if (util.module()) {
        module.exports = World
    } else {
        window.World = World
    }

}).call(this)