const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const checkJWT = require('../middlewares/checkJwt');

//Bringing in the models
const User = require('../models/users');
const Follow = require('../models/follow');

//GET request 
//ROUTE: /follow/:follower_id
//Follow a User or Unfollow a User
//INPUT: token, @params: follower_id
//Private Access
router.get('/:follower_id', checkJWT, async (req, res) => {
  const followFields = {
    user: req.decoded.data._id,
    followed: req.params.follower_id
  };
  const check = await Follow.findOne({ user: followFields.user, followed: followFields.followed });
  if(!check){
    //New Follow Request
    const follow = await new Follow(followFields).save();
    await User.findOneAndUpdate({ _id: followFields.user }, { $push: { following: follow.id }}, { new: true });
    await User.findOneAndUpdate({ _id: followFields.followed }, { $push: { followers: follow.id }}, { new: true });
    const user = await User.findOne({ _id: follow.followed });
    res.send('You just Followed '+user.name);
  }else{
    //Unfollow Request
    const unfollow = await Follow.findOneAndRemove({ _id: check.id });
    const pullFollower = await User.findOneAndUpdate({ _id: unfollow.followed }, { $pull: { followers: unfollow.id }}, { new: true });
    const pullFollowing = await User.findOneAndUpdate({ _id: unfollow.user }, { $pull: { following: unfollow.id }}, { new: true });
    res.send(pullFollowing.name+ ' Unfollowed '+pullFollower.name);
  }
});

module.exports = router;