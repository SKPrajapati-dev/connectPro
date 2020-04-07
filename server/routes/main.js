const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const checkJWT = require('../middlewares/checkJwt');
const config = require('../config/config');

//Bringing in the Models
const User = require('../models/users');

//Signup Route /signup
//INPUT: 
// (string): name,
// (string): email,
// (password): password
//Public access
router.post('/signup', (req, res) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });
  User.findOne({ email: newUser.email })
    .then(user => {
      if(user){
        res.json({ success: false, msg: 'Email Already Exists...Please try a different one.', user: user});
      }else{
        User.addUser(newUser, function(err) {
          if(err){
            res.json({success: false, msg:'Failed to register user'});
          } else{
            res.json({success: true, msg:'User Registered Successfully'});
          }
        });
      }
    });
  
});
//Login Route /login
//INPUT:
// (string): email,
// (string): password
//Public access
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //Get the use by EmailId
  User.getUserByEmail(email, (err, user) => {
    if(!user){
      return res.json({ success: false, msg: 'User not found'});
    }
    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        User.findOneAndUpdate({ email: email }, { isOnline: true },{ new: true })
          .then(updatedUser => {
            const token = jwt.sign({ data: updatedUser }, config.secret, {expiresIn: 604800});
            console.log(user.email);
            res.json({
              success: true,
              token: token,
              user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isOnline: updatedUser.isOnline
              }
            });
          });
      }else{
        return res.json({ success: false, msg: 'Wrong Password'});
      }
    });
  });
});
//GET rquest /logout
//Logout from system
//INPUT: token
//Private Access
router.get('/logout', checkJWT, (req, res) => {
  const authToken = req.decoded.data._id;
  User.findOneAndUpdate({ _id: authToken }, { isOnline: false}, {new: true})
    .then(loggedOutUser => {
      console.log(loggedOutUser.isOnline);
      res.json({
        success: true,
        msg: 'user Logged Out Successfully'
      });
    });
});

module.exports = router;