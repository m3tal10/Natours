const express = require('express');
const viewsController = require('../controllers/viewsController');
const { authenticate, isLoggedIn } = require('../controllers/authController');

const router = express.Router();
router.use(viewsController.alert);
router.get('/', isLoggedIn, viewsController.getOverview);
router.get('/me', authenticate, viewsController.getMe);
router.get('/my-bookings', authenticate, viewsController.getBookings);
router.get('/tour/:slug', isLoggedIn, viewsController.getTourView);
router.get('/login', isLoggedIn, viewsController.loginView);
router.get('/signup', viewsController.signUpView);
router.get('/forgot-password', viewsController.forgotPasswordView);
router.get('/reset-password/:token', viewsController.resetPasswordView);

module.exports = router;
