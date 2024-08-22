const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../controllers/authController');

const router = express.Router();
router.use(authenticate);

router.route('/checkout-session/:id').get(bookingController.getCheckoutSession);

//Only allow admins and lead-guides to manage bookings

router.use(authorize('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
