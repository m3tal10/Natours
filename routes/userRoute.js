const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//Authentication based
router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.logIn);
router.route('/logout').get(authController.logOut);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

//User based
router.use(authController.authenticate);
//user actions
router.route('/changePassword').patch(authController.changePassword);
router
  .route('/user')
  .get(userController.getMe, userController.getUser)
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe,
  )
  .delete(userController.deleteMe);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.authorize('admin'), userController.updateUser)
  .delete(authController.authorize('admin'), userController.deleteUser);

//admin actions
router.use(authController.authorize('admin'));
router.route('/').get(userController.getUsers).post(userController.updateUser);

module.exports = router;
