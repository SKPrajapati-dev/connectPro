const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//NotificationShcema
const NotificationShcema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    like: {
      type: Schema.Types.ObjectId,
      ref: 'Like'
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    follow: {
      type: Schema.Types.ObjectId,
      ref: 'Follow'
    },
    seen: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = Notification = mongoose.model('Notification', NotificationShcema);