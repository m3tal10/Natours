const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('unhandledRejection', (err) => {
  console.log(err.name, '+', err.message);
  console.log('Unhandled Rejection! Shutting Down...');
  process.exit(1);
});

dotenv.config({
  path: `./config.env`,
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log('DB Connection Successful...');
});

//Server
const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
process.on('uncaughtException', (err) => {
  console.log('Uncaught exception! Shutting Down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
