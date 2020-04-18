const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    followed: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = Follow = mongoose.model('Follow', FollowSchema);