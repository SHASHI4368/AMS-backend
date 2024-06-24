const db = require("../../database/database");
const { sendAppointmentAcceptMail } = require("../mailController");
require("dotenv").config();

const getAppointmentCount = (req, res) => {
  const { Lecturer_mail } = req.params;
  const sql = `select count(*) from APPOINTMENT where Lecturer_mail = ?`;
  try {
    db.all(sql, [Lecturer_mail], (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const getLastAppointment = (req, res) => {
  const sql = `select * from APPOINTMENT order by Id desc limit 1`;
  try {
    db.all(sql, (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const addBlockTimeSlot = (req, res) => {
  const { Id, Lecturer_mail, StartTime, EndTime } = req.body;
  const sql = `insert into APPOINTMENT(Id, Lecturer_mail, StartTime, EndTime, Apt_status, Subject) values(?,?,?,?,?,?)`;
  try {
    db.run(
      sql,
      [Id, Lecturer_mail, StartTime, EndTime, "Blocked", "Blocked"],
      (err) => {
        if (err) {
          return res.json({
            error: true,
          });
        } else {
          return res.json({
            error: false,
            message: "Time slot blocked successfully",
          });
        }
      }
    );
  } catch (err) {
    return res.json({
      error: true,
    });
  }
};

const addAppointment = (req, res) => {
  const {
    Id,
    Lecturer_mail,
    Student_reg,
    Subject,
    Description,
    StartTime,
    EndTime,
    Apt_status,
  } = req.body;
  const sql = `insert into APPOINTMENT(Id, Lecturer_mail, Student_reg, Subject, Description, StartTime, EndTime, Apt_status) values(?,?,?,?,?,?,?,?)`;
  try {
    db.run(
      sql,
      [
        Id,
        Lecturer_mail,
        Student_reg,
        Subject,
        Description,
        StartTime,
        EndTime,
        Apt_status,
      ],
      (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        } else {
          return res.json({
            message: "Appointment added successfully",
          });
        }
      }
    );
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const getApt = (Id) => {
  const sql = `SELECT * FROM APPOINTMENT WHERE Id = ?`;
  return new Promise((resolve, reject) => {
    db.all(sql, [Id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getDate = (value) => {
  const date = new Date(value);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};

const getTime = (value) => {
  const date = new Date(value);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedTime = `${formattedHours}:${formattedMinutes}`;
  if (formattedTime === "NaN:NaN") {
    return "";
  } else {
    return formattedTime;
  }
};

const acceptAppointment = async (req, res) => {
  const { Id } = req.params;
  const sql = `UPDATE APPOINTMENT SET Apt_status = "Confirmed" WHERE Id = ?`;

  try {
    const appointmentRows = await getApt(Id);
    const appointment = appointmentRows[0];

    const studentRows = await getStd(appointment.Student_reg);
    const student = studentRows[0];

    const staffRows = await getStaff(appointment.Lecturer_mail);
    const staffDetails = staffRows[0];

    const stdMail = student.Email;
    const subject = "Appointment confirmed";
    const content = `
      <p>Dear student,</p>
      <p>Your appointment with ${staffDetails.First_name} ${
      staffDetails.Last_name
    } has been confirmed.</p>
      <h2>Appointment Details:</h2>
      <p>Date: ${getDate(appointment.StartTime)}</p>
      <p>Time: ${getTime(appointment.StartTime)} - ${getTime(
      appointment.EndTime
    )}</p>
      <br>
      <p>${staffDetails.First_name} ${staffDetails.Last_name}</p>
      <p>${staffDetails.Email}</p>
      <p>${staffDetails.Department}</p>
    `;

    sendAppointmentAcceptMail(stdMail, subject, content);

    db.run(sql, [Id], (err) => {
      if (err) {
        res
          .status(500)
          .send(
            `<html><body><h1>Error</h1><p>${err.message}</p></body></html>`
          );
      } else {
        res.send(`
          <html>
            <head>
              <title>Appointment Accepted</title>
            </head>
            <body>
              <h1>Appointment Accepted</h1>
              <p>The appointment has been accepted successfully and notified to the student.</p>
            </body>
          </html>
        `);
      }
    });
  } catch (err) {
    res
      .status(500)
      .send(`<html><body><h1>Error</h1><p>${err.message}</p></body></html>`);
  }
};

const getAllAppointments = (req, res) => {
  const { Lecturer_mail } = req.params;
  const sql = `select * from APPOINTMENT where Lecturer_mail = ?`;
  try {
    db.all(sql, [Lecturer_mail], (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const getStudentAppointments = (req, res) => {
  const { department, year, regNumber } = req.params;
  const Reg_number = `${department}/${year}/${regNumber}`;
  const sql = `select * from APPOINTMENT where Student_reg = ?`;
  try {
    db.all(sql, [Reg_number], (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const getAllConfirmedAppointments = (req, res) => {
  const { Lecturer_mail } = req.params;
  const sql = `SELECT * FROM APPOINTMENT WHERE Lecturer_mail = ? AND Apt_status = "Confirmed" ORDER BY StartTime`;
  try {
    db.all(sql, [Lecturer_mail], (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const updateAppointment = (req, res) => {
  const { Id, Subject, Description, StartTime, EndTime, Apt_status, Reason } =
    req.body;
  const sql = `update APPOINTMENT set Subject = ?, Description = ?, StartTime = ?, EndTime = ?, Apt_status = ?, Reason = ? where Id = ?`;
  try {
    db.run(
      sql,
      [Subject, Description, StartTime, EndTime, Apt_status, Reason, Id],
      (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        } else {
          return res.json({
            message: "Appointment updated successfully",
          });
        }
      }
    );
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const deleteAppointment = (req, res) => {
  const { Id } = req.params;
  const sql = `delete from APPOINTMENT where Id = ?`;
  try {
    db.run(sql, [Id], (err) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json({
          message: "Appointment deleted successfully",
        });
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const deleteAppointmentByEmail = (req, res) => {
  const { Id } = req.params;
  const sql = `delete from APPOINTMENT where Id = ?`;
  try {
    db.run(sql, [Id], (err) => {
      if (err) {
        res
          .status(500)
          .send(
            `<html><body><h1>Error</h1><p>${err.message}</p></body></html>`
          );
      } else {
        res.send(`
          <html>
            <head>
              <title>Appointment Deleted</title>
            </head>
            <body>
              <h1>Appointment Deleted</h1>
              <p>The appointment has been deleted successfully.</p>
            </body>
          </html>
        `);
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const getAppointment = (req, res) => {
  const { Id } = req.params;
  const sql = `select * from APPOINTMENT where Id = ?`;
  try {
    db.all(sql, [Id], (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

module.exports = {
  addAppointment,
  getAppointmentCount,
  getAllAppointments,
  getLastAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointment,
  getAllConfirmedAppointments,
  acceptAppointment,
  addBlockTimeSlot,
  deleteAppointmentByEmail,
  getStudentAppointments,
};
