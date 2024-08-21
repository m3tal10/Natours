const Review = require('../models/reviewModel');
// const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);

exports.createReview = catchAsync(async (req, res, next) => {
  const tourId = req.body.tour || req.params.id;
  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    user: req.user._id,
    tour: tourId,
  });

  res.status(201).json({
    status: 'Success',
    data: {
      review,
    },
  });
});

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
