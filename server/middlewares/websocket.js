const socketio = require('socket.io');
const jwt = require('jsonwebtoken');

//Bringing in the models
const Notification = require('../models/notification');
const Post = require('../models/post');
const SocketUser = require('../models/socketusers');

const io = socketio();

var users = {};
io.on('connection', (socket) => {
  //Authenticating the socket connection
  socket.on('userAuth', (token, callback) => {
    authToken = token;
    jwt.verify(token, config.secret, function(err, decoded){
      if(err){
        callback(false);
      }else{
        let newSocketUser = {
          socketid: socket.id,
          userid: decoded.data.id,
          useremail: decoded.data.email
        };
        SocketUser(newSocketUser).save();
        socket.userEmail = decoded.data.email;
        users[socket.userEmail] = socket.id;

        callback(decoded);
      }
    });
  });
  //Send message request from sender 
  socket.on('sendMsg', (data, callback) => {
    if(users[data.to]){
      //Sending the message to specific user via socket
      io.to(users[data.to]).emit('getMsg', {msg: data.msg, from: socket.userEmail });
    }else{
      //User is offline
      callback(false); 
    }
  });
  //Notification Request
  //input: data: {
    //author: author id,
    //postid: post id ,
    //notificationType: the type of notification such as comment,like,follow
    //notificationTypeId: the id of type of notification to store
  //}
  socket.on('requestNotification', async (data) => {
    let postAuthor = await Post.findById(data.postid, { author:1});
    let notification = await new Notification({
      author: data.author,
      user: postAuthor.author,
      post: postAuthor._id,
      [data.notificationType.toLowerCase()]: data.notificationTypeId
    }).save();
    //Checking into socketuser collection
    SocketUser.findOne({ userid: postAuthor.author })
      .then(socketUser => {
        if(socketUser){
          //User is Online
          io.to(socketUser.socketid).emit('receiveNotification', notification);
        } //Else send a email or something
      });
    
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

module.exports = io;