import mongoose from 'mongoose';
import User from '../models/user_model';
import ParentProfile from '../models/parent_model';
import { sendEmail } from '../controllers/emailController';
import { USER_TYPES } from '../../../../config/userTypes';
import validator from 'validator';
import bcrypt from 'bcrypt-nodejs';
/**
 * POST /signup
 * Create a new local account
 */
export function parentSignup(req, res, next) {
  const profile = new ParentProfile({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    telephone: req.body.telephone,
    address: req.body.address,
    birthday: req.body.birthday,
  });

  User.findOne({ username: req.body.username }, (findErr, existingUser) => {
    if (existingUser) {
      return res.sendStatus(409);
    }

    const user = new User({
      username: req.body.username,
      password: req.body.password,
      user_role: USER_TYPES.Parent,
      profile: profile._id
    });

    return profile.save((saveErr) => {
      if (saveErr) return next(saveErr);
      return user.save((_saveErr) => {
        if (_saveErr) return next(_saveErr);
        return req.logIn(user, (loginErr) => {
          if (loginErr) return res.sendStatus(401);
          return res.status(200).send(
            {
              username: req.body.username,
              user_role: USER_TYPES.Parent
            }
          );
        });
      });
    });
  });
}

export function authorizeParent(req, res, next) {
  const legalParent = req.user && req.user.user_role === USER_TYPES.Parent && req.user.profile.locked === false;
  if (req.isAuthenticated() && legalParent) {
    return next();
  }
  return res.sendStatus(401);
}

export function addCredits(req, res, next) {
  var credits = Number(req.body.credits);
  const profileId = req.user.profile.id;
  if(credits >= 50 && credits <= 100) {
    credits += 3;
  }
  else if (credits > 100) {
    credits += 7;
  }
  if (!isNaN(credits) && credits > 0) {
    ParentProfile.findByIdAndUpdate(profileId, { $inc: { credits } }, { new: true}, (err, profile) => {
      if (err) return next(err);
      const creditsUpdated = profile.credits;
      return res.send({ credits: creditsUpdated });
    }
  );
  } else {
    return res.sendStatus(400);
  }
}

export function getCredits(req, res, next) {
  const profileId = req.user.profile.id;
  ParentProfile.findById(profileId, (err, profile) => {
    if (err) return next(err);
    const credits = profile.credits;
    return res.send({ credits });
  }
);
}

export function parentData(req, res) {
  const user = req.user;
  const data = {
    username: user.username,
    profile: user.profile
  };

  return res.send(data);
}

export function changeProfile(req, res, next) {
  var objForUpdate = {};
  if (req.body.name) objForUpdate.name = req.body.name;
  if (req.body.surname) objForUpdate.surname = req.body.surname;
  if (req.body.email) objForUpdate.email = req.body.email;
  if (req.body.telephone) objForUpdate.telephone = req.body.telephone;
  if (req.body.address) objForUpdate.address = req.body.address;
  if (req.body.birthday) objForUpdate.birthday = req.body.birthday;

	const profileId = req.user.profile.id;
	if (!(req.body.email) || !(req.body.telephone) || (validator.isEmail(req.body.email) && (req.body.telephone).length>7)) {
	 ParentProfile.findByIdAndUpdate(profileId, { $set: objForUpdate}, { new: true}, (err, profile) => {
      if (err) return next(err);
      const nameUpdated = profile.name;
	    const surnameUpdated = profile.surname;
	    const emailUpdated = profile.email;
	    const telephoneUpdated = profile.telephone;
	    const addressUpdated = profile.address;
	    const birthdayUpdated = profile.birthday;

      return res.send({ name: nameUpdated, surname: surnameUpdated,  email: emailUpdated, telephone: telephoneUpdated, address: addressUpdated, birthday: birthdayUpdated });
    }
  );
} else {
    return res.sendStatus(400);
  }

}

const saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);

export function changeCredentials(req, res, next) {
  var objForUpdate = {};
  if (req.body.username) objForUpdate.username = req.body.username;
  if (req.body.password) {

  var hash = bcrypt.hashSync(req.body.password, salt);
  objForUpdate.password = hash;
  }
	const profileId=req.user.id;
	if(!(req.body.password) || (req.body.password).length > 3 ){
	User.findByIdAndUpdate(profileId, { $set: objForUpdate}, {new: true}, (err,profile) => {
	 if (err) return next(err);
	 const usernameUpdated = profile.username;
	 const passwordUpdated= profile.password;

	 return res.send({username: usernameUpdated});
	 }
	);
}  else {
     return res.sendStatus(400);
}

}

export function forgotPassword(req, res){

    User.findOne({ username: req.body.username }).populate('profile').exec((findErr, user) => {
        if (!user) {
          return res.status(404).send("Κανένας χρήστης δεν βρέθηκε με αυτό το όνομα");
        }
        const data = {
          email:user.profile.email,
          username:user.username
        };
        const emailBody = 'Καλησπέρα σας, ο λογαριασμός με όνομα χρήστη ' + data.username + ' στην πλατφόρμα PLAYGROUND έκανε αίτηση ανάκλησης κωδικού.';
        const subject = 'Ανάκληση κωδικού χρήστη στην πλατφόρμα PLAYGROUND';
        const mailOptions = {
          from: data.email,
          to: 'admin@playground.com',
          text: emailBody,
          subject: subject,
        };
        sendEmail(mailOptions);
        return res.sendStatus(200);
})
}

export function resetPassword(req, res, next){

   User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }).populate('profile').exec((err, user)=> {
     if (!user) {
       return res.status(404).send("To token έχει λήξει");
     }
     console.log(user);
     console.log(user.profile.email);
     user.password = req.body.password;
     user.resetPasswordToken = undefined;
     user.resetPasswordExpires = undefined;

     user.save((_saveErr) => {
       if (_saveErr) return next(_saveErr);

     });


   var mailOptions = {
     from: 'admin@playground.com',
     to: user.profile.email,
     text: 'Καλησπέρα,\n\n' +
       'Επιβεβαίωση ότι ο κωδικός του χρήστη ' + user.username + ' έχει αλλάξει.\n',
     subject: 'Ο κωδικός έχει αλλάξει'
   };

      sendEmail(mailOptions);
      return res.sendStatus(200);
   });
}

export function messageToPlatform(req, res, next) {
  const profileId = req.user.profile.id;
  const username = req.user.username;
  const subject = req.body.subject;
  const message = req.body.message;
  ParentProfile.findById(profileId, (err, profile) => {
    if (err) return next(err);
    const email = profile.email;
    const emailBody = 'username: ' + username + '\n email: ' + email + '. \n ' + message;
    const mailOptions = {
      from: 'system@playground.com',
      to: 'admin@playground.com',
      text: emailBody,
      subject: subject,
    };
    sendEmail(mailOptions);
    return res.sendStatus(200);
  });
}

export default {
  parentSignup,
  authorizeParent,
  parentData,
  addCredits,
  getCredits,
  changeProfile,
  changeCredentials,
  forgotPassword,
  resetPassword,
  messageToPlatform
};
