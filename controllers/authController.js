const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

//JWT Sign
const jwtSign = (payload) =>
  jwt.sign({ id: payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

//JWT verify
const jwtVerify = async (token) =>
  await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//create and send JWToken
const createAndSendJWT = (user, status, req, res) => {
  const token = jwtSign(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  //removes the password from the output
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(status).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({ ...req.body, role: 'user' });
  createAndSendJWT(newUser, 201, req, res);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if the email and the password exists
  if (!email || !password) {
    return next(new AppError('Please provide an email or a password.', 400));
  }
  //check if the user exists and the password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  //if everything is correct the send the token to the client
  createAndSendJWT(user, 200, req, res);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

//Check if the user is logged in.
exports.isLoggedIn = async (req, res, next) => {
  try {
    //getting the token to see if it's really there
    if (req.cookies.jwt) {
      const token = req.cookies.jwt;
      //verify token
      const decoded = await jwtVerify(token);

      //check if the user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //check if the user changed password after the jwt was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      //grant access to the protected route
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.authenticate = catchAsync(async (req, res, next) => {
  let token;
  //getting the token to see if it's really there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else
    return next(new AppError('You are not logged in. Please log in.', 400));

  //verify token
  const decoded = await jwtVerify(token);

  //check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token no longer exist.', 401),
    );
  }
  //check if the user changed password after the jwt was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Password has been changed recently. Please log in again.',
        401,
      ),
    );
  }
  //grant access to the protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// eslint-disable-next-line arrow-body-style
exports.authorize = (...roles) => {
  return catchAsync(async (req, res, next) => {
    //roles is an array ['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this action.', 403),
      );
    }
    next();
  });
};

//Forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //check if the user is valid
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  //generate a random token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it back as an email
  const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Please try again a few moments later.',
        500,
      ),
    );
  }
});

//reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new AppError(
        'Reset request is invalid or has expired. Please try again.',
        400,
      ),
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const JWT = jwtSign(user._id);
  res.status(200).json({
    status: 'success',
    token: JWT,
  });
});

//Change password functionality for logged in users
exports.changePassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user._id).select('+password');
  const candidatePass = req.body.password;
  if (
    !(await currentUser.correctPassword(candidatePass, currentUser.password))
  ) {
    return next(
      new AppError(
        'Incorrect password. Please provide the correct password.',
        400,
      ),
    );
  }
  currentUser.password = req.body.changePassword;
  currentUser.passwordConfirm = req.body.passwordConfirm;
  await currentUser.save();

  //log in user again after successfully updating the password.
  createAndSendJWT(currentUser, 200, req, res);
});
