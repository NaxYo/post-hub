var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var config = require('./config.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.post('/:endpoint', function(req, res) {
  var endpoint = config['endpoints'].find(function(endpoint) {
    return req.params.endpoint === endpoint.path;
  });

  if(endpoint) {
    io.emit(endpoint.event, req.body);
    console.log('Endpoint fired: ' + req.params.endpoint);
  }
  else {
    console.log('Unknown endpoint: ' + req.params.endpoint);
  }
  res.end();
});

io.on('connection', function(socket) {
  console.log('User #' + socket.id + ' connected');

  socket.on('disconnect', function() {
    console.log('User #' + socket.id + ' disconnected');
  });
});

http.listen(config['port'], function() {
  console.log('listening on *:' + config['port']);
});
