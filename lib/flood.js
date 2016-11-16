"use strict";

(function() {

    function Flood(tests) {
        var _ = this
        _.tests = tests

        _.connected = () => {
            return _.ws && _.ws.readyState === _.ws.OPEN
        }
        _.listeners = {
            '*': []
        }
        _.on = (event, callback) => {
            if (!_.listeners[event])
                _.listeners[event] = []
            _.listeners[event].push(callback)
        }
        _.b = (event, args) => {
            for (var i in _.listeners['*'])
                setTimeout(() => {
                    _.listeners['*'][i](event, args)
                })
            if (!_.listeners[event]) return
            for (var i in _.listeners[event])
                setTimeout(() => {
                    _.listeners[event][i](args)
                })
        }

        _.connect = addr => {
            // Prevent accidental reconnections
            if (_.connected()) return

            // Load address
            if (addr) _.addr = addr
            else addr = _.addr

            // Connect
            _.b('connecting', addr)
            var ws = new WebSocket(addr)

            // Setup websocket
            ws.onopen = function() {
                _.ws = ws

                _.ws.onmessage = function(evt) {
                    var data = JSON.parse(evt.data)
                    _.b('data', data)
                }

                _.b('connected')
            }


            ws.onclose = function() {
                // Reconnect in a second
                _.ws = null
                setTimeout(() => {
                    location.reload()
                }, 2000)
                _.b('closed')
            }

        }

        // Send message
        _.send = (type, args) => {
            if (_.connected()) {
                var pack = {
                    type: type,
                    args: args
                }
                _.ws.send(JSON.stringify(pack))
                _.b('sent', pack)
            }
        }

        _.start = (uri) => {
            _.connect(uri)
            _.on('connected', () => {
                _.send('next')
            })
            _.on('data', (data) => {
                var type = data.type,
                    args = data.args

                switch (type) {
                    case 'stats':
                        window.stats = args
                        break

                    case 'test':
                        var callback = dna => {
                            _.send('res', dna)
                        }
                        _.tests[args.test](args, callback)
                        break
                }
            })

        }
    }


    if (typeof module != 'undefined') {
        module.exports = Flood
    } else {
        window.Flood = Flood
    }

}).call(this)