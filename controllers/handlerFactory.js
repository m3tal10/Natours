const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = req.params.id ? { tour: req.params.id } : {};
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const documents = await features.query; //.explain()
    res.status(200).json({
      status: 'success',
      size: documents.length,
      data: {
        documents,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const query = Model.findById(id);
    if (popOptions) query.populate(popOptions);
    const document = await query;
    if (!document) {
      return next(new AppError('Document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        document,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError('Tour not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });
