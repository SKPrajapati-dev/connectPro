const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//SocketSchema
const SocketUserSchema = new Schema(
  {
    socketid: {
      type: String
    },
    userid: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    useremail: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = SocketUser = mongoose.model('SocketUser', SocketUserSchema);