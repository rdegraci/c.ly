var express = require('express')
var sys = require("sys")
var util = require('util')
var socketio = require("socket.io")
var spawn = require('child_process').spawn;
var Buffer = require('buffer').Buffer

app = express.createServer()
app.listen(8082)

app.configure(function(){
    app.use(express.methodOverride())
    app.use(express.bodyParser())
    app.use(app.router)
    app.use(express.static(__dirname + '/public'))
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

var io = socketio.listen(app)

var c_program = ''
var locked = false

io.sockets.on('connection', function(client) {

  client.on('modify', function(message) {
    if (locked) return;
    locked = true

    console.log("modify:  ", message)
    c_program = message


    var chunks = [],
        length = 0

    var filename = '' + (new Date()).getTime() + Math.random()
    console.log(filename)

    var gcc = spawn('./compile.sh', [filename])
    gcc.stdout.on('data', function(data) {
        chunks.push(data)
        length += data.length
    })
    gcc.stdin.write(c_program)
    gcc.stdin.end()
    gcc.on('exit', function() {
        var buf = new Buffer(length),
            i = 0
        
        chunks.forEach(function(b) {
            b.copy(buf, i, 0, b.length)
            i += b.length
        })
        
        client.emit('stdout', { timestamp: (new Date()).getTime(), text: buf.toString() })
        locked=false
    })
  })
})
