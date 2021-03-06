var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clientSocket = io;
var secretword;
app.use(express.static('public'));



app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// connection event is triggered when the io() is called
// on the client side
io.on('connection', function(clientSocket){
  console.log('a user connected');

  clientSocket.on("server-drawing", function(drawingData) {
    clientSocket.broadcast.emit("client-drawing",drawingData);
  });
  clientSocket.on('server-reset', function() {
    // console.log("I should be resetting");
    io.emit('client-reset');
  });

  clientSocket.on('client-join', function(username) {
    clientSocket.username = username;
    clientSocket.broadcast.emit('join', username);
  });
  // disconnect event is triggered when the user closes
  // the browser tab, for example
  clientSocket.on('disconnect', function() {
    io.emit('leave', clientSocket.username);
  });


  clientSocket.on('clientSecretWord', function(clientSecretWord){
    secretword = clientSecretWord;
    console.log(secretword);
  });

  // listen for chat messages
  clientSocket.on('message-to-server', function(msg){
    if (msg.message.indexOf(secretword)!== -1) {
      console.log("winner");
      var winnerData = {
        secretword: secretword,
        username: clientSocket.username
      };
      io.emit("Winner", winnerData);
      return;
    }
      clientSocket.broadcast.emit('message-to-client', msg);
  });

  clientSocket.on('start-type', function(username) {
    clientSocket.broadcast.emit('start-type', username);
  });

  clientSocket.on('end-type', function(username) {
    clientSocket.broadcast.emit('end-type', username);
  });



});


http.listen(8000, function(){
  console.log('Listening on 8000');
});
