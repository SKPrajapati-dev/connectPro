const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    comment: {
      type: String,
      required: true
    },
    replies: [
      {
        reply: {
          type: String,
        },
        from: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = Comment = mongoose.model('Comment', CommentSchema);