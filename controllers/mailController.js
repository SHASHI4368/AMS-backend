const nodemailer = require("nodemailer");
const MailGen = require("mailgen");
const { EMAIL, PASSWORD } = require("./credendials");

// const proxy = "http://192.168.49.1:8282";
// const proxy = "http://10.50.225.222:3128";

const sendMail = (req, res) => {
  const { user, code } = req.body;
  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    // secure: true,
    // proxy: proxy,
  };

  let transporter = nodemailer.createTransport(config);
  const mailGenerator = new MailGen({
    theme: "default",
    product: {
      name: "AMS",
      link: "https://mailgen.js/",
    },
  });

  let response = {
    body: {
      name: user.name,
      intro: "Your verification code is",
      table: {
        data: [
          {
            item: "Verification Code",
            code: code,
          },
        ],
      },
      outro: "Please enter this code to verify your account",
    },
  };

  let mail = mailGenerator.generate(response);
  let message = {
    from: EMAIL,
    to: user.email,
    subject: "Verification Code for AMS Ruhuna",
    html: mail,
  };

  transporter.sendMail(message, (err) => {
    if (err) {
      res.status(500).json(err.message);
    } else {
      res.status(201).json({
        msg: "Verification code sent successfully",
      });
    }
  });
};

const sendVerificationMail = (req, res) => {
  const { email, code } = req.body;
  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    // secure: true,
    // proxy: proxy,
  };

  let transporter = nodemailer.createTransport(config);
  let message = {
    from: EMAIL,
    to: email,
    subject: "Verification Code for AMS Ruhuna",
    html: `
      <p>Hello New User,</p>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>Please enter this code to verify your account.</p>
    `,
  };

  transporter.sendMail(message, (err) => {
    if (err) {
      res.status(500).json(err.message);
    } else {
      res.status(201).json({
        msg: "Verification code sent successfully",
      });
    }
  });
};

const sendAppointmentAddedMail = (req, res) => {
  const { lecMail, subject, content } = req.body;
  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    // secure: true,
    // proxy: proxy,
  };
  let transporter = nodemailer.createTransport(config);
  let message = {
    from: EMAIL,
    to: lecMail,
    subject: subject,
    html: content,
  };

  transporter.sendMail(message, (err) => {
    if (err) {
      res.json(err.message);
    } else {
      res.status(201).json({
        msg: "Request sent successfully",
      });
    }
  });
};

const sendAppointmentAcceptMail = (stdMail, subject, content) => {
  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    // secure: true,
    // proxy: proxy,
  };
  let transporter = nodemailer.createTransport(config);
  let message = {
    from: EMAIL,
    to: stdMail,
    subject: subject,
    html: content,
  };

  transporter.sendMail(message, (err) => {
    if (err) {
      res.status(500).json(err.message);
    } else {
      res.status(201).json({
        msg: "Request sent successfully",
      });
    }
  });
};

const sendAppointmentUpdateMail = (req, res) => {
  const { stdMail, subject, content } = req.body;
  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    // secure: true,
    // proxy: proxy,
  };
  let transporter = nodemailer.createTransport(config);
  let message = {
    from: EMAIL,
    to: stdMail,
    subject: subject,
    html: content,
  };

  transporter.sendMail(message, (err) => {
    if (err) {
      res.status(500).json(err.message);
    } else {
      res.status(201).json({
        msg: "Request sent successfully",
      });
    }
  });
};

module.exports = {
  sendMail,
  sendVerificationMail,
  sendAppointmentAddedMail,
  sendAppointmentUpdateMail,
  sendAppointmentAcceptMail,
};
