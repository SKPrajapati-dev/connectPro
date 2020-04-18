const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const checkJWT = require('../middlewares/checkJwt');

//Multer Constants
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/profilePhotos/');
  },
  filename: function(req, file, cb){
    cb(null, req.decoded.data._id + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
  }
});
const fileFilter = (req, file, cb) => {
  //Reject a file
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
    cb(null, true);
  }else{
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter: fileFilter
});

//Bringing in the models
const Profile = require('../models/profile');
const User = require('../models/users');

//GET request  ROUTE: /profile
//Getting the profile of the logged in user
//INPUT: token
//Private access
router.get('/', checkJWT, (req, res) => {
  Profile.findOne({ user: req.decoded.data._id})
    .populate('user', ['name', 'email'])
    .then(profile => {
      if(!profile){
        return res.status(404).json({msg: 'No porfile found'});
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ msg: 'No profile found'}));
});

//POST Request for new and updating profile
//ROUTE: /profile
//INPUT: token,
// {string: handle}, {string: company}, { string: website}, {string: location}, {string: bio},{string: status}
// { string: githubusername},{ string[]: skills (sperated by comma)},{string: youtube},{string: facebook},{string:twitter},{string: linkedin},{string: instagram}, {file: avatar}
//Private access
router.post('/', checkJWT, upload.single('avatar'), (req, res) => {
  //Get Fields
  const profileFields = {};
  profileFields.user = req.decoded.data._id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  //Skills Split into array
  if(typeof req.body.skills !== 'undefined'){
    profileFields.skills = req.body.skills.toString().split(',');
  }

  //Social 
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
  var str = 'http://localhost:3001/'
  if(req.file) profileFields.avatar = str + req.file.path.replace(/\\/g, "/");

  Profile.findOne({ user: req.decoded.data._id })
    .then(profile => {
      if(profile){
        //Update Profile
        Profile.findOneAndUpdate({ user: req.decoded.data._id }, { $set: profileFields }, { new: true })
          .then(profile => res.json(profile));
      }else{
        //Create
        //Check if handle exists
        Profile.findOne({ handle: profileFields.handle })
          .then(profile => {
            if(profile){
              return res.status(400).json({ error: 'That handle already exists' });
            }
            //Save Profile
            new Profile(profileFields).save().then(profile => res.json(profile));
          });
      }
    });
});
//POST Request for Adding Experience
//ROUTE: /profile/experience
//INPUT: token,
// {string: title},{string: company},{string:location},{Date: from},{Date: to},{string: description},{boolean: current}
//Private access
router.post('/experience', checkJWT, (req, res) => {
  Profile.findOne({ user: req.decoded.data._id })
    .then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        description: req.body.description,
        current: req.body.current
      }

      //Add to exp array
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });

});

//POST Request fro Adding Education
//ROUTE: /profile/education
//INPUT: token,
//{string:institute},{string:degree},{string:fieldofstudy},{string:location}
//{string: description},{Date:from},{Date:to},{Boolean:current}
//private Access
router.post('/education', checkJWT, (req, res) => {
  Profile.findOne({ user: req.decoded.data._id })
    .then(profile => {
      const newEdu = {
        institute: req.body.institute,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        location: req.body.location,
        description: req.body.description
      }
      //Add Education to education array
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile));
    });
});

//DELETE Request to delete experience 
//ROUTE: /profile/experience/:exp_id
//INPUT: token, @params: exp_id
//Private Access
router.delete('/experience/:exp_id', checkJWT, (req, res) => {
  Profile.findOne({ user: req.decoded.data._id }).then(profile => {
    //Get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id); //finding the index of the matching substring
    
      //Splice out if array
      profile.experience.splice(removeIndex, 1);
      //Save 
      profile.save().then(profile => res.json(profile));
  }).catch(err => res.status(404).json(err));
});

//DELETE Request to delete education
//ROUTE: /profile/education/:edu_id
//INPUT: token, @params: edu_id
//Private access
router.delete('/education/:edu_id', checkJWT, (req, res) => {
  Profile.findOne({ user: req.decoded.data._id }).then(profile => {
    //Get remove index
    const removeIndex = profile.education
      .map(item =>item.id)
      .indexOf(req.params.edu_id);

    //Splice out of array
    profile.education.splice(removeIndex, 1);
    //Save
    profile.save().then(profile => res.json(profile));
  }).catch(err => res.json(err));
});

//POST Request for Updating account details 
//ROUTE: /profile/account
//INPUT: token, {string:name},{string:email},{string: password}
//Private access
router.post('/account', checkJWT, (req, res) => {
  
  const updatedAccount = {};
  if(req.body.name) updatedAccount.name = req.body.name;
  if(req.body.email) updatedAccount.email = req.body.email;
  if(req.body.password) {
    updatedAccount.password = req.body.password;
    //Get the use by EmailId
    User.updateUserPassword(updatedAccount.password, (err, newPassword) => {
      if(err) throw err;
      if(newPassword){
        updatedAccount.password = newPassword;
        User.findOneAndUpdate({ _id: req.decoded.data._id }, { $set: updatedAccount})
          .then(updatedUser => res.json({sucess: true}))
          .catch(err => res.json(err));
      }
    });
  }
  User.findOneAndUpdate({ _id: req.decoded.data._id }, { name: updatedAccount.name, email: updatedAccount.email })
    .then(updatedUser => res.json({ success: true }));

});

//DELETE request for deleting user and profile
//ROUTE: /profile
//INPUT: token
//private access
router.delete('/', checkJWT, (req, res) => {
  Profile.findOneAndRemove({ user: req.decoded.data._id })
    .then(() => {
      User.findOneAndRemove({ _id: req.decoded.data._id }).then(() => {
        res.json({ success: true });
      });
    });
});



module.exports = router;