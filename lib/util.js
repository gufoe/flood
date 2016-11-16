"use strict";

(function() {
    var util = {

        solve: (x) => {
            return typeof x == 'function' ? x() : x
        },
        min: function(arr, field) {
            var min = 0
            for (var i in arr)
                if (util.solve(arr[i][field]) < util.solve(arr[min][field]))
                    min = i
            return min
        },

        max: function(arr, field) {
            var max = 0
            for (var i in arr)
                if (util.solve(arr[i][field]) > util.solve(arr[max][field]))
                    max = i
            return max
        },

        remove: function(arr, obj) {
            var i = arr.indexOf(obj)
            i >= 0 && arr.splice(i, 1)
        },

        query: function(key) {
            try {
                return location.search.match(new RegExp(key + "=(.*?)($|\&)", "i"))[1]
            } catch (e) {
                return undefined
            }
        },

        window: function() {
            return typeof window != 'undefined' ? window : null
        },

        module: function() {
            return typeof module != 'undefined' ? module : null
        },

        pick: function(arr) {
            return arr[parseInt(arr.length * Math.random())]
        },

        clone: (obj) => {
            return JSON.parse(JSON.stringify(obj))
        },

        exports: (src) => {
            if (util.window()) return window
            if (util.module()) return src.module.exports
            return self
        }
    }

    if (util.module())
        module.exports = util
    else
        util.exports(this).util = util
}).call(this)