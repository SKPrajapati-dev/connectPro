const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    caption : String,
    image: String,
    video: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Like'
      }
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = Post = mongoose.model('Post', PostSchema);