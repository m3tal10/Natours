const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewsSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty.'],
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be 1 or greater.'],
    max: [5, 'Rating must be 5 or lesser.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'Review must belong to a user.'],
    ref: 'User',
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'Review must belong to a tour.'],
    ref: 'Tour',
  },
});

reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewsSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewsSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  }
};

reviewsSchema.post('save', function () {
  // "this" points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// reviewsSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne().clone();
//   next();
// });
// reviewsSchema.post(/^findOneAnd/, async function () {
//   this.constructor.calcAverageRatings(this.r.tour);
// });

const Reviews = mongoose.model('Review', reviewsSchema);
module.exports = Reviews;
