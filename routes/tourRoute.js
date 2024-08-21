const express = require('express');

const tourController = require('../controllers/tourController');
const { authenticate, authorize } = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

// Route Handlers
const router = express.Router();
// router.param('id', tourController.checkId);
// way to review router
router.use('/:id/reviews', reviewRouter);

//geospatial routes
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

//home routes
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authenticate,
    authorize('admin', 'lead-guide'),
    tourController.createTour,
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authenticate,
    authorize('admin', 'lead-guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authenticate,
    authorize('admin', 'lead-guide'),
    tourController.deleteTour,
  );

router.route('/stats/tour-stats').get(tourController.getTourStats);
router
  .route('/stats/monthly-plan/:year')
  .get(
    authenticate,
    authorize('admin', 'lead-guide'),
    tourController.getMonthlyStats,
  );

module.exports = router;
