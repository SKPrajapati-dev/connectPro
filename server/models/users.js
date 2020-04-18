const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Follow'
    }
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Follow'
    }
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

const User = module.exports = mongoose.model('User', UserSchema);

//User Collection Methods Used in Routes
module.exports.addUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(newUser.password, salt, function(err, hash){
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.updateUserPassword = function(newPassword, callback){
  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(newPassword, salt, function(err, hash){
      if(err) throw err;
      newPassword = hash;
      callback(null, newPassword);
    });
  });
}

module.exports.getUserByEmail = function(email, callback){
  const query = {email: email}
  User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) =>{
    if(err) throw err;
    callback(null, isMatch);
  });
}