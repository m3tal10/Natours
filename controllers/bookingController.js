const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');

const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const Bookings = require('../models/bookingModel');
const User = require('../models/userModel');

exports.getAllBookings = factory.getAll(Bookings);
exports.getBooking = factory.getOne(Bookings);
exports.createBooking = factory.createOne(Bookings);
exports.updateBooking = factory.updateOne(Bookings);
exports.deleteBooking = factory.deleteOne(Bookings);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //01. get the currently booked tour
  const tour = await Tour.findById(req.params.id);

  //02. Create the checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name.toUpperCase()} TOUR`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
  });
  //03. Send the session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //it is unsecure because everyone would be able to
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();
//   await Bookings.create({
//     tour,
//     user,
//     price,
//   });
//   res.redirect(req.originalUrl.split('?')[0]);
// });
const createBookingCheckout = async (session, req, res) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email });
  const price = session.amount_subtotal / 100;
  await Bookings.create({ tour, user: user.id, price });
  res.redirect(req.originalUrl);
};

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object, req, res);
  }
  res.status(200).json({ received: true });
});
