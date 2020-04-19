const express = require('express');
const router = express.Router();
const checkJWT = require('../middlewares/checkJwt');

//Bringing in the models
const User = require('../models/users');
const Notification = require('../models/notification');

//GET request PATH:/notification/getNotification
//Gets notifications for a specific user
//INPUT: 
//  string: token - user token
//  int: skip- how many notifications to skip
//  int: limit - how many notifications to limit
//Private ACCESS
router.get('getNotification'. checkJWT, async(req, res) => {
  let notifications = await Notification.find({ user: req.decoded.data._id});
  res.send(notifications);
});