var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var config = require('./config.json');

function defaultContentTypeMiddleware(req, res, next) {
  if(config['forced_content_type'])
    req.headers['content-type'] = config['forced_content_type'];
  else if(config['default_content_type'])
    req.headers['content-type'] = req.headers['content-type'] || config['default_content_type'];

  next();
}

app.use(defaultContentTypeMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/:endpoint', function(req, res) {
  var endpoint;

  for(var i in config['endpoints']) {
    if(req.params.endpoint === config['endpoints'][i].path) {
      endpoint = config['endpoints'][i];
      break;
    }
  };

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
