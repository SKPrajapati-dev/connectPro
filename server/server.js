const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const socketio = require('socket.io');
const socketJWT = require('socketio-jwt');
const jwt = require('jsonwebtoken');

// Application Server Constant \\app
const app = express();

const server = app.listen(3001, function(err){
  if(err) console.log(err);
  console.log('Server Started at Port 3001');
});

//SocketIO middleware
const io = socketio(server);
var users = {};
io.on('connection', (socket) => {
  //Authenticating the socket connection
  socket.on('userAuth', (token, callback) => {
    authToken = token;
    jwt.verify(token, config.secret, function(err, decoded){
      if(err){
        callback(err);
      }else{
        socket.userEmail = decoded.data.email;
        users[socket.userEmail] = socket;
        callback(decoded);
      }
    });
  });
  //Send message request from sender 
  socket.on('sendMsg', (data, callback) => {
    if(users[data.to]){
      //Sending the message to specific user via socket
      users[data.to].emit('getMsg', {msg: data.msg, from: socket.userEmail });
    }else{
      callback(false); 
    }
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

//Mongoose Connection
mongoose.connect(config.database, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.connection.on('connected', function(){
  console.log('Connected to Database');
});
mongoose.connection.on('error', function(err){
  console.log('Database Error:' +err);
});

//Bringing in Services
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods","GET,POST,PATCH,DELETE,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
  next();
});

//Bringing in Routes 
const mainRoutes = require('./routes/main');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/post');
const likeRoutes = require('./routes/like');
const commentRoutes = require('./routes/comment');
const followRoutes = require('./routes/follow');
const messageRoutes = require('./routes/message');

//Using the Routes 
app.use('/', mainRoutes);
app.use('/profile', profileRoutes);
app.use('/post', postRoutes);
app.use('/like', likeRoutes);
app.use('/comment', commentRoutes);
app.use('/follow', followRoutes);
app.use('/message', messageRoutes);
