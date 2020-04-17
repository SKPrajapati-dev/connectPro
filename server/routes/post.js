const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const checkJWT = require('../middlewares/checkJwt');

//Bringing in the models
const User = require('../models/users');
const Post = require('../models/post');
const Like = require('../models/like');
const Follow = require('../models/follow');
const Comment = require('../models/comment');

//Multer Constants
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/posts/');
  },
  filename: function(req, file, cb){
    cb(null, req.decoded.data._id + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  //Reject a file
  if(file.mimetype === 'image/jpeg' || file.mimetype  === 'image/jpg' || file.mimetype === 'image/png'){
    cb(null, true);
  }else{
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024* 10
  },
  fileFilter: fileFilter
});


//GET Route /post/dashboard
//Getting Posts of followed Users
//Private Access
router.get('/dashboard', checkJWT, async (req, res) => {
  let Posts = {};
  const followings = await Follow.find({ user: req.decoded.data._id });
  if(followings){
    for(var i=0; i< followings.length;i++){
      Posts[i] = await Post.findOne({ author: followings[i].followed})
        .populate('comments');
    }
    res.send(Posts);
  }else{
    res.json({ msg: 'You are not following anyone..Follow some users to explore '});
  }
});

//GET Route /post
//Getting Post of Logged in User
//Private access
router.get('/myposts', checkJWT, (req, res) => {
  Post.find({ author: req.decoded.data._id})
    .populate('author', ['name', 'email'])
    .then(post => {
      if(!post){
        return res.status(404).json({msg: 'No Posts found'});
      }
      res.json(post);
    })
    .catch(err => res.status(404).json({ msg: err}));
});

//POST Route /post/create
//Creatig a post
//Private access
router.post('/create', checkJWT, upload.single('post'), async (req, res) => {
  const postFields = {};
  postFields.author = req.decoded.data._id;
  if(req.body.caption) postFields.caption = req.body.caption;
  var str = 'http://localhost:3001/';
  if(req.file) postFields.image = str + req.file.path.replace(/\\/g,"/");
  const post = await new Post(postFields).save();
  User.findOneAndUpdate({ _id: req.decoded.data._id }, { $push: { posts: post._id}}, { new: true })
    .then(posts => res.send(posts));
});

//DELETE route /post
//Deleting a post
//Private Access
router.delete('/:post_id', checkJWT, async (req, res) => {
  const loginUser = req.decoded.data._id;
  const selectedPost = await Post.findOne({ _id: req.params.post_id });
  if(selectedPost){
    const author = selectedPost.author;
    if(author.equals(loginUser) ==  true){
      const removedPost = await Post.findOneAndRemove({ _id: selectedPost.id });
      getRemovedLikes({ post: removedPost.id }, function(error, response){
        getRemovedComments({ post: removedPost.id }, function(err, response2){
          User.findOneAndUpdate({ _id: loginUser }, { $pull: { posts: removedPost.id }}, { new: true })
            .then(user => {
              const output = {
                comments: response2,
                likes: response,
                post: removedPost
              };
              res.send(output);
            });
        });
      });
    }else{
      res.send('UNAUTHORIZED: You are not the author of the Comment');
    }
  }else{
    res.send('No posts found');
  }
  function getRemovedLikes(filter, callback){
    Like.find(filter, function (err, data) {
      if(err){
        callback(err);
      }else{
        Like.deleteMany(filter, function(err, response){
          if(err){
            callback(err);
          }else{
            callback(null, data);
          }
        });
      }
    });
  }
  function getRemovedComments(filter, callback){
    Comment.find(filter, function(err, data){
      if(err){
        callback(err);
      }else{
        Comment.deleteMany(filter, function(err, response){
          if(err){
            callback(err);
          }else{
            callback(null, data);
          }
        });
      }
    });
  }
});

module.exports = router;