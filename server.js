var express = require('express')
var sys = require("sys")
var util = require('util')
var socketio = require("socket.io")
var spawn = require('child_process').spawn;
var Buffer = require('buffer').Buffer
var fs = require('fs')

app = express.createServer()
app.listen(8084)

app.configure(function(){
    app.use(express.methodOverride())
    app.use(express.bodyParser())
    app.use(app.router)
    app.use(express.static(__dirname + '/public'))
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

var io = socketio.listen(app)

var c_program = '#include <stdio.h>\n\nint main(void) {\n  printf("asdf\\n")\n  return 0;\n}\n'
var syntax = 'clike'
var stdout = ''
var stderr = ''
var last_c_program_saved = c_program

var recompiling = false
var needs_recompile = false

var locked = false
var lockTimeout

io.sockets.on('connection', function(client) {
  client.emit('modify', c_program)
  client.emit('syntax', syntax)
  client.emit('stdout', { timestamp: (new Date()).getTime(), text: stdout, error: stderr })
  client.emit( (locked ? 'lock' : 'unlock') )

  client.on('syntax', function(message) {
    syntax = message
    client.broadcast.emit('syntax', syntax)
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

    recompile()
  })
})


function recompile() {
  needs_recompile = true

  if (recompiling) return;

  recompiling = true

  var chunks = [],
      err_chunks = [],
      length = 0,
      err_length = 0

  var filename = '' + (new Date()).getTime() + Math.random()
  console.log(filename)

  var gcc = spawn('./compile.sh', [filename, syntax])
  gcc.stdout.on('data', function(data) {
      chunks.push(data)
      length += data.length
  })
  gcc.stderr.on('data', function(data) {
      err_chunks.push(data);
      err_length += data.length;
  })
  gcc.stdin.write(c_program)
  gcc.stdin.end()
  gcc.on('exit', function() {
      var buf = new Buffer(length),
          err_buf = new Buffer(err_length),
          i = 0
      
      chunks.forEach(function(b) {
          b.copy(buf, i, 0, b.length)
          i += b.length
      })

      i=0
      err_chunks.forEach(function(b) {
          b.copy(err_buf, i, 0, b.length)
          i += b.length
      })

      stdout = buf.toString()
      stderr = err_buf.toString()
      
      io.sockets.emit('stdout', { timestamp: (new Date()).getTime(), text: stdout, error: stderr })
      locked=false

      recompiling = false
      if (needs_recompile) {
          recompile()
          needs_recompile = false
      }
  })
}



setInterval(function() {
  if (c_program == last_c_program_saved) { return; }

  last_c_program_saved = c_program

  var d = new Date();
  var fname = "history/" + d.toJSON().replace(/[^0-9]/g,'')
  fs.writeFile(fname, c_program)
}, (1000*30)) // once a minute
