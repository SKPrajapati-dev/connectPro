const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const checkJWT = require('../middlewares/checkJwt');

//Bringing in the models
const User = require('../models/users');
const Post = require('../models/post');
const Like = require('../models/like');

//POST Route /like
//Liking/Unliking a post of a user 
//Private access
router.post('/', checkJWT, async (req, res) => {
  const likeFields = {};
  if(req.body.postid) likeFields.post = req.body.postid;
  likeFields.user = req.decoded.data._id;
  const like = await Like.findOne({ $and : [{ user:req.decoded.data._id }, { post: req.body.postid }]});
    if(!like){
      //Liking the post
      const liked = await new Like(likeFields).save();
      Post.findOneAndUpdate({ _id: req.body.postid }, { $push: { likes: liked.id }}, { new: true })
        .then(likedPost => res.send(likedPost));
    }else{
      //Unliking the post
      await Post.findOneAndUpdate({ _id: like.post }, { $pull: { likes: like._id } });
      Like.findOneAndRemove({ _id: like._id })
        .then(unlikedPost => res.send(unlikedPost));
    }

});


module.exports = router;