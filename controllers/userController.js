const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const upload = require('../public/js/multerConfig');

// const fs = require('fs');
// async function importUser() {
//   const user = fs.readFileSync(
//     `${__dirname}/../dev-data/data/users.json`,
//     'utf-8',
//   );
//   await User.create(JSON.parse(user));
// }
// importUser();

//multer file upload
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// Route Handlers
exports.getUsers = factory.getAll(User);
exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //check the user name,email,photo
  const currentUser = await User.findById(req.user._id);
  const updatedInfo = {
    name: req.body.name ?? currentUser.name,
    email: req.body.email ?? currentUser.email,
    photo: req.file?.filename ?? currentUser.photo,
  };
  updatedUser = await User.findByIdAndUpdate(currentUser.id, updatedInfo, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { deleted: true });
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.deleteUser = factory.deleteOne(User);
