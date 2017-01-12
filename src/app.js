import fs from 'fs';
import * as sqlite3 from 'sqlite3';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const streamToClient = (socket, tableName) => {
  const db = new sqlite3.Database('../../c3m/backend/database.sqlite');
  db.serialize(() => {
    db.all("SELECT * FROM " + tableName, (err, rows) => {
      socket.emit('database/updated', rows);
    });
  });
  db.close();
};

io.on('connection', socket => {
  console.log('a user connected');
  let tableName = 'User';

  // fs.watch('./database.txt', (a, b) => {
  fs.watch('../../c3m/backend/database.sqlite', (a, b) => {
    console.log(a, b);
    streamToClient(socket, tableName);
  });

  socket.on('set/table', name => {
    console.log('tableName: ' + name);
    tableName = name;
    streamToClient(socket, tableName);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
