const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicate = (err) => {
  const message = `There is already a field named: ${Object.values(err.keyValue)[0]}`;
  return new AppError(message, 400);
};
const handleValidation = (err) => {
  const msgArr = Object.values(err.errors).map((data) => data.message);
  const message = msgArr.join(' ');
  return new AppError(message, 400);
};

const handleJsonWebTokenError = (err) => {
  const message = 'Invalid token. Please log in again.';
  return new AppError(message, 401);
};

const handleTokenExpiredError = (err) => {
  const message = 'Token expired. Please log in again.';
  return new AppError(message, 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    //for API
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      operational: err.isOperational ?? false,
      stack: err.stack,
    });
  } else {
    //rendered website
    res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong.',
      message: err.message,
    });
  }
};

const sendErrorProduction = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    //operational trusted error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        operational: err.isOperational ?? false,
      });
    }
    //Unknown error, don't want to leak the details to the client
    else {
      console.error('Error!', err);
      return res.status(500).json({
        status: 'Error!',
        message: 'Oops! Something went wrong.',
      });
    }
  }

  //operational trusted error
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong.',
      message: err.message,
    });
  }
  //Unknown error, don't want to leak the details to the client
  console.error('Error!', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong.',
    message: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastError(error);
    else if (error.code === 11000) error = handleDuplicate(error);
    else if (error.name === 'ValidationError') error = handleValidation(error);
    else if (error.name === 'ValidationError') error = handleValidation(error);
    else if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);
    else if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);
    sendErrorProduction(error, req, res);
  }
  next();
};
