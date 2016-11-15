"use strict";

if (typeof require != 'undefined') {
    var util = require('./util.js')
}

(function() {

    var World = function() {
        var finished = false

        this.init = (pool, options) => {
            if (options.mix) {
                this.pool = []
                for (var i = 0; i < options.mix; i++) {
                    this.pool.push(util.pick(pool).clone().mutate())
                }
            } else {
                this.pool = pool
            }
        }

        this.destroy = () => {
            ;
        }

        // Update the game
        this.update = () => {
            for (var i in this.pool) {
                this.pool[i].update()
            }
            finished = true
        }

        // Returns whether the world is ended
        this.finished = () => {
            return finished
        }

        // Returns the best dna
        this.best = () => {
            return this.pool[util.max(this.pool, 'score')]
        }
    }

    if (util.module()) {
        module.exports = World
    } else {
        window.World = World
    }

}).call(this)