const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    sender:{
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    seen:{
      type: Boolean,
      default: false
    },
    image: String,
    file: String
  },
  {
    timestamps: true
  }
);

module.exports = Message = mongoose.model('Message', MessageSchema);