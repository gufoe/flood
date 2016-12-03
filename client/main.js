"use strict";
{
    importScripts('lib/test.js')
}

(function() {

    var Client = function(uri) {
        this.ws = null
        this.cmd = {
            pull: 'p',
            push: '+'
        }
        this.queue = []
        this.seq = 0
    }

    Client.prototype.connect = function(uri, onconnect) {
        var self = this
        this.ws = new WebSocket(uri)
        // if (!this.ws.readyState) {
        //     console.log('Connection to', uri, 'failed')
        //     return _reload()
        // }
        this.ws.onopen = () => {
            console.log('Connected to', uri)
            onconnect()
        }

        this.ws.onclose = () => {
            console.log('Connection to', uri, 'dropped')
            _reload()
        }

        this.ws.onmessage = (e) => {
            var message = null,
                seq = null
            try {
                message = JSON.parse(e.data)
                seq = message.seq
            } catch (e) {
                console.error("Invalid message received from server")
                return
            }

            if (seq) {
                if (seq in this.queue) {
                    this.queue[seq](message)
                } else {
                    // Callback has been killed
                }
            } else {
                // No sequence number, message is not a reply
            }
        }

    }

    Client.prototype.send = function(packet, callback) {
        // Packet id
        var seq = packet.seq = ++this.seq,
            self = this


        if (callback) {
            // Kill the packet callback in 10 seconds
            var timeout = setTimeout(() => {
                delete self.queue[seq]
            }, 10000)
            // Remove the callback
            this.queue[seq] = (message) => {
                delete this.queue[seq]
                clearTimeout(timeout)
                callback && callback(message)
            }
        }

        this.ws.send(JSON.stringify(packet))
    }

    Client.prototype.pull = function(callback) {
        this.send({
            command: this.cmd.pull
        }, (message) => {
            callback(message.subjects)
        })
    }

    Client.prototype.push = function(score, subject) {
        this.send({
            command: this.cmd.push,
            score: parseFloat(score),
            subject: typeof subject == 'string' ? subject : JSON.stringify(subject),
        })
    }

    var _client = null

    var _post = this._post = (command, data) => {
        postMessage({
            command: command,
            data: data
        })
    }

    var _reload = () => {
        _post('reload')
        close()
    }

    if (typeof _init == 'undefined') {
        console.error('No _init function defined')
        _reload()
    }
    onmessage = (e) => {
        var args = e.data
        if (args.server) {
            _client = new Client()
            _client.connect(args.server, () => {
                _init({
                    client: _client,
                    draw: args.draw
                })
            })
        }
    }

}).call(this)
