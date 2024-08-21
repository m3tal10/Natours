const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name. '],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'A user must have an email. '],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email. '],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'Invalid role.',
    },
  },
  password: {
    type: String,
    required: [true, 'A user must provide a password. '],
    minlength: [8, 'Please provide a password with a minimum length of 8. '],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm password cannot be empty. '],
    validate: {
      validator: function (el) {
        //"this" keyword only works for save and create.
        return el === this.password;
      },
      message: 'Confirm password must be the same as password. ',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  deleted: {
    type: Boolean,
    default: false,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //only updates the password if the password has been changed
  if (!this.isModified('password')) return next();
  //Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete the password confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  //only updates the passwordChangedAt if the password has been changed
  if (!this.isModified('password') || this.isNew) return next();
  //delete the password confirm field
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};
//Generating password reset token for forgot password to send it via email
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
//comparing password reset token
userSchema.methods.verifyPasswordResetToken = function (token) {
  return crypto.compare(token, this.passwordResetToken);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
