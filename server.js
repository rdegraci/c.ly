var express = require('express')
var sys = require("sys")
var util = require('util')
var socketio = require("socket.io")
var spawn = require('child_process').spawn;
var Buffer = require('buffer').Buffer
var fs = require('fs')
var Compiler = require('./lib/compiler'); 

app = express.createServer()
app.listen(3000)

app.configure(function(){
    app.use(express.methodOverride())
    app.use(express.bodyParser())
    app.use(app.router)
    app.use(express.static(__dirname + '/public'))
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

var io = socketio.listen(app, { 'log level': 1 })


var c_program = '#include <stdio.h>\n\nint main(void) {\n  printf("asdf\\n")\n  return 0;\n}\n'
c_program = fs.readFileSync('history/' + fs.readdirSync('history/').slice(-1)[0]).toString()
var syntax = 'clike'
var stdout = ''
var stderr = ''
var last_c_program_saved = c_program

var recompiling = false
var needs_recompile = false

var locked = false
var lockTimeout


var compiler = new Compiler(c_program, syntax); 

io.sockets.on('connection', function(client) {
  client.emit('modify', c_program)
  client.emit('syntax', syntax)
  client.emit('stdout', { timestamp: (new Date()).getTime(), text: stdout, error: stderr })
  client.emit( (locked ? 'lock' : 'unlock') )

  client.on('syntax', function(message) {
    syntax = message
    client.broadcast.emit('syntax', syntax)
    compiler.syntax = syntax; 
    compiler.recompile(c_program); 
  })

  client.on('modify', function(message) {
    if (!locked) {
        client.broadcast.emit('lock')
    }

    locked = true
    clearTimeout(lockTimeout)
    lockTimeout = setTimeout(function() {
        io.sockets.emit('unlock')
    }, 3000)

    client.broadcast.emit('modify', message)

    console.log("modify:  ", message)
    c_program = message

    compiler.recompile(c_program)
  })
})


compiler.on('recompiled', function(a){
    io.sockets.emit('stdout', a); 
    locked=false; 
})



setInterval(function() {
  if (c_program == last_c_program_saved) { return; }

  last_c_program_saved = c_program

  var d = new Date();
  var fname = "history/" + d.toJSON().replace(/[^0-9]/g,'')
  fs.writeFile(fname, c_program)
}, (1000*30)) //every 30 seconds 
