const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkJWT = require('../middlewares/checkJwt');

//Bringing in the Models
const User = require('../models/users');
const Message = require('../models/message');

//POST request /message
//Sending a Message to the User
//Private Access
router.post('/', checkJWT, async (req, res) => {
  const msgFields = {};
  msgFields.sender = req.decoded.data._id;
  if(req.body.receiver) msgFields.receiver = req.body.receiver;
  if(req.body.message) msgFields.message = req.body.message;
  let newMessage = await new Message(msgFields).save();
  const senderUser = await User.findById(msgFields.sender);
  if(!senderUser.messages.includes(msgFields.receiver)){
    await User.findOneAndUpdate(
      { _id: msgFields.sender },
      { $push: {
        messages: msgFields.receiver
      }}
    );
    await User.findOneAndUpdate(
      { _id: msgFields.receiver },
      { $push: {
        messages: msgFields.sender
      }}
    );
    res.send(newMessage);
  }
  res.send(newMessage);
});

//GET request /message/userchat/:chatUser_id
//Getting user specific conversations or chats // API for after opening a conversation getting all the messages between two users
//Privte Access
router.get('/userchat/:chatUser_id', checkJWT, async (req, res) => {
  const authUser = req.decoded.data._id;
  const chatUser = req.params.chatUser_id;
  let specificMessages = await Message.find({
    $and: [
      {
        $or: [
          { sender: authUser },
          { receiver: authUser }
        ]
      },
      {
        $or: [
          { sender: chatUser },
          { receiver: chatUser }
        ]
      }
    ]
  });
  res.send(specificMessages);
});

//GET request /message/chats
// Get Users with whom AuthUser had conversations //API for getting all the conversations like whatsapp home page
//Private Access
router.get('/chats', checkJWT, async (req, res) => {
  const authUser = req.decoded.data._id;
  //Getting users with whom AuthUser had a chat
  const users = await User.findById(authUser).populate('messages','id name isOnline');
  //Getting last messages with whom the authUser had a chat
  const lastMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          { receiver: mongoose.Types.ObjectId(authUser) },
          { sender: mongoose.Types.ObjectId(authUser) }
        ]
      }
    },
    { $sort: { createdAt: -1 }},
    {
      $group: {
        _id: '$sender',
        doc: { $first: '$$ROOT'}
      }
    },
    { $replaceRoot: { newRoot: '$doc' } }
  ]);

  //Atach message properties to users
  const conversations = [];
  users.messages.map(u => {
    const user = {
      id: u.id,
      name: u.name,
      isOnline: u.isOnline
    };

    const sender = lastMessages.find(m => u.id === m.sender.toString());
    if(sender){
      user.seen = sender.seen;
      user.lastMessageCreatedAt = sender.createdAt;
      user.lastMessage = sender.message;
      user.lastMessageSender = false;
    }else{
      const receiver = lastMessages.find(m => u.id === m.receiver.toString());
      if(receiver){
        user.seen = receiver.seen;
        user.lastMessageCreatedAt = receiver.createdAt;
        user.lastMessage = receiver.message;
        user.lastMessageSender = true;
      }
    }
    conversations.push(user);
  });

  //Sort users by last created messages date
  const sortedConversations = conversations.sort((a, b) =>
    a.lastMessageCreatedAt.toString().localeCompare(b.lastMessageCreatedAt)
  );
  res.send(sortedConversations);
});

//POST reuest /message/updateseen/
//Request for updating the seen field of ny message
//Private Access
router.post('/updateseen', async (req, res) =>{
  const sender = req.body.sender;
  const receiver = req.body.receiver;
  try{
    const updateMessageSeen = await Message.update(
      { receiver, sender, seen: false },
      { seen: true },
      { multi: true }
    );
    res.send(updateMessageSeen);
  }catch(err){
    res.send(err);
  }
});

//Test
router.get('/test/:id', async (req, res) => {
  let okay = await Message.findByIdAndRemove(req.params.id);
  res.send(okay);
});

module.exports = router;