const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Bookings = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTourView = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    field: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.loginView = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

exports.signUpView = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
};

exports.getMe = async (req, res, next) => {
  res.status(200).render('dashboard', {
    title: 'Dashboard',
  });
};

exports.getBookings = catchAsync(async (req, res, next) => {
  const bookings = await Bookings.find({ user: req.user.id });
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'Bookings',
    tours,
  });
});
