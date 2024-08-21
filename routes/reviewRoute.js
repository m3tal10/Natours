const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authorize('user'), reviewController.createReview);
router
  .route('/:id')
  .patch(authorize('admin', 'user'), reviewController.updateReview)
  .delete(authorize('admin', 'user'), reviewController.deleteReview);

module.exports = router;
