const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkJWT = require('../middlewares/checkJwt');

//Bringing in the models
const User = require('../models/users');
const Post = require('../models/post');
const Comment = require('../models/comment');

//GET request /comment
//Getting comments and replies of a post
//Public Access
router.get('/:post_id', (req, res) => {
  Comment.find({ post: req.params.post_id })
    .populate('author')
    .then(comments => {
      res.send(comments);
    });
});

//POST request /comment
//Writing a comment from a logged in user
//Private Access
router.post('/comm', checkJWT, async (req, res) => {
  const commentFields = {};
  if(req.body.postid) commentFields.post = req.body.postid;
  if(req.body.comment) commentFields.comment = req.body.comment;
  commentFields.author = req.decoded.data._id;
  const comment = await new Comment(commentFields).save();
  Post.findOneAndUpdate({ _id: commentFields.post }, { $push: { comments: comment.id }}, { new: true })
    .then(commentedPost => res.send(commentedPost));
});

//POST request /comment/reply
//Replying to a comment
//Private Access
router.post('/reply', checkJWT, (req, res) => {
  const replyFields = {};
  replyFields.from = req.decoded.data._id;
  if(req.body.reply) replyFields.reply = req.body.reply;
  Comment.findOne({ _id: req.body.commentid })
    .then(commentFound => {
      if(commentFound){
        Comment.findOneAndUpdate({ _id: req.body.commentid }, { $push: { replies: replyFields }}, { new: true })
          .then(replied => res.send(replied));
      }else{
        res.send('No Comments Found');
      }
    });
});

//DELETE request /comment
//Deleting a comment
//Private Access
router.delete('/:comment_id', checkJWT, async (req, res) => {
  const loggedUser = req.decoded.data._id;
  const selectedComment = await Comment.findOne({ _id: req.params.comment_id });
  if(selectedComment){
    const author = selectedComment.author;
    if(author.equals(loggedUser) == true){
      const removedComment = await Comment.findOneAndRemove({ _id: selectedComment.id });
      Post.findOneAndUpdate({ _id: selectedComment.post }, { $pull: { comments: removedComment.id }}, { new: true }).then(removedCommentPost => res.send(removedCommentPost));
    }else{
      res.send('You are not the author of this Comment');
    }
  }else{
    res.send('No Comments find at this URL');
  }
});

module.exports = router;