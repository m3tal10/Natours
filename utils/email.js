const nodeMailer = require('nodemailer');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Mashrafie Rahim Sheikh <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sending real email with Brevo

      return nodeMailer.createTransport({
        host: process.env.EMAIL_BREVO_HOST,
        port: process.env.EMAIL_BREVO_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_BREVO_USER,
          pass: process.env.EMAIL_BREVO_PASSWORD,
        },
      });
    }

    //Sending dummy emails to mailtrap for development
    return nodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //Send the actual email

  async send(template, subject) {
    //01. Render HTML using the PUG template from the arguments
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject: this.subject,
      },
    );
    //02. Define mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };
    //03. Create a transporter and send the mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Reset your password');
  }
};

// const sendEmail = async (options) => {
//   //define the email options

//     // html:
//   };
//   //send the mail with nodemailer
//   await transporter.sendMail(mailOptions);
// };
