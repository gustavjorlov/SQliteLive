'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _sqlite = require('sqlite3');

var sqlite3 = _interopRequireWildcard(_sqlite);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var streamToClient = function streamToClient(socket, tableName) {
  var db = new sqlite3.Database('../../c3m/backend/database.sqlite');
  db.serialize(function () {
    db.all("SELECT * FROM " + tableName, function (err, rows) {
      socket.emit('database/updated', rows);
    });
  });
  db.close();
};

io.on('connection', function (socket) {
  console.log('a user connected');
  var tableName = 'User';

  // fs.watch('./database.txt', (a, b) => {
  _fs2.default.watch('../../c3m/backend/database.sqlite', function (a, b) {
    console.log(a, b);
    streamToClient(socket, tableName);
  });

  socket.on('set/table', function (name) {
    console.log('tableName: ' + name);
    tableName = name;
    streamToClient(socket, tableName);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});