const multer = require('multer');
const AppError = require('../../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    const error = new AppError(
      'Not an image. Please upload an image file.',
      400,
    );
    cb(error, false);
  }
};

module.exports = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
