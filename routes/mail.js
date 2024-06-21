const mailRouter = require("express").Router();
const {sendMail, sendVerificationMail, sendAppointmentAddedMail, sendAppointmentUpdateMail} = require('../controllers/mailController');

mailRouter.post('/send', sendMail);
mailRouter.post('/student/verify', sendVerificationMail);
mailRouter.post('/student/request/appointment', sendAppointmentAddedMail);
mailRouter.post('/student/update/appointment', sendAppointmentUpdateMail);

module.exports = mailRouter;