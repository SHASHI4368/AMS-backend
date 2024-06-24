const sqlite = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendAppointmentAcceptMail } = require("./mailController");
const { json } = require("body-parser");
require("dotenv").config();

const db = new sqlite.Database("./ams.db", sqlite.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the database.");
  }
});

const getStudents = (req, res) => {
  const sql = `select Email from STUDENT`;
  console.log(first);
  try {
    db.all(sql, [], (err, rows) => {
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

const getStudentByEmail = (req, res) => {
  const { Email } = req.params;
  const sql = `select Email from STUDENT where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
      if (err) {
        res.sendStatus(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.sendStatus(500).json(err.message);
  }
};

const getStaffList = (req, res) => {
  const sql = `select * from LECTURER`;
  try {
    db.all(sql, [], (err, rows) => {
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

const getDepartmentStaff = (req, res) => {
  const { Department } = req.params;
  const sql = `select Email, First_name, Last_name, Department, Picture_URL, Title, Position from LECTURER where Department = ?`;
  try {
    db.all(sql, [Department], (err, rows) => {
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

const getStaffPassword = (req, res) => {
  const { Email } = req.params;
  const sql = `select Original_password from LECTURER where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
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

const addStudent = async (req, res) => {
  const {
    Reg_number,
    First_name,
    Last_name,
    Department,
    Email,
    Batch,
    Password,
  } = req.body;
  const sql = `insert into STUDENT(Reg_number, First_name, Last_name, Department, Email, Batch, Password) values(?,?,?,?,?,?,?)`;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    db.run(
      sql,
      [
        Reg_number,
        First_name,
        Last_name,
        Department,
        Email,
        Batch,
        hashedPassword,
      ],
      (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        } else {
          return res.json({
            message: "Student added successfully",
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

const handleStdLogin = async (req, res) => {
  const { Email, Password } = req.body;
  const sql = `select * from STUDENT where Email = ?`;

  try {
    db.all(sql, [Email], async (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }

      const foundStudent = rows[0];
      const isMatch = await bcrypt.compare(Password, foundStudent.Password);

      if (!isMatch) {
        return res.json({ message: "Invalid credentials" });
      }

      // Create JWT token
      const accessToken = jwt.sign(
        { Reg_number: foundStudent.Reg_number },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "60s" }
      );
      const refreshToken = jwt.sign(
        { Reg_number: foundStudent.Reg_number },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const sql = `update STUDENT set RefreshToken = ? where Email = ?`;
      db.run(sql, [refreshToken, Email], (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        }
      });

      res.json({ Status: "Success", RefreshToken: refreshToken });
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const handleStaffLogin = async (req, res) => {
  const { Email, Original_password } = req.body;
  const sql = `select * from LECTURER where Email = ?`;

  try {
    db.all(sql, [Email], async (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }
      const foundStaff = rows[0];
      const isMatch = await bcrypt.compare(
        Original_password,
        foundStaff.Password
      );

      if (!isMatch) {
        return res.json({ message: "Invalid credentials" });
      }

      // Create JWT token
      const accessToken = jwt.sign(
        { Email: foundStaff.Email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "60s" }
      );
      const refreshToken = jwt.sign(
        { Email: foundStaff.Email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const sql = `update LECTURER set RefreshToken = ? where Email = ?`;
      db.run(sql, [refreshToken, Email], (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        }
      });
      res.json({ Status: "Success", RefreshToken: refreshToken });
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const getStudentRegNumber = (req, res) => {
  const { Email } = req.params;
  const sql = `select Reg_number from STUDENT where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
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

const handleStdRefreshToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ message: "Refresh token is missing or malformed" });
  }

  const RefreshToken = authHeader.split(" ")[1];

  const sql = `SELECT * FROM STUDENT WHERE RefreshToken = ?`;

  try {
    db.all(sql, [RefreshToken], async (err, rows) => {
      if (err) {
        return res.json({ error: err.message });
      }

      if (rows.length === 0) {
        return res.json({ message: "No user found" });
      }

      const foundStudent = rows[0];

      jwt.verify(
        RefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err || foundStudent.Reg_number !== decoded.Reg_number) {
            return res.json({ message: "Invalid refresh token" });
          }
          const accessToken = jwt.sign(
            { Reg_number: foundStudent.Reg_number },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "60s" }
          );
          return res.json({ accessToken: accessToken });
        }
      );
    });
  } catch (err) {
    return res.json({ error: err.message });
  }
};

const handleStaffRefreshToken = async (req, res) => {
  const RefreshToken = req.headers.authorization;
  //---------------------------------------------------------
  const sql = `select * from LECTURER where RefreshToken = ?`;

  try {
    db.all(sql, [RefreshToken], async (err, rows) => {
      if (err) {
        return res.json({ error: err.message });
      }

      if (rows.length === 0) {
        return res.json({ message: "No user found" });
      }

      const foundStaff = rows[0];

      //evaluate the refresh token
      jwt.verify(
        RefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err || foundStaff.Email !== decoded.Email) {
            return res.json({ message: "Invalid refresh token" });
          }
          const accessToken = jwt.sign(
            { Email: foundStaff.Email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "60s" }
          );
          return res.json({ accessToken: accessToken });
        }
      );
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const handleStdLogout = async (req, res) => {
  const RefreshToken = req.headers.authorization;
  //---------------------------------------------------------
  const sql = `select * from STUDENT where RefreshToken = ?`;
  try {
    db.all(sql, [RefreshToken], async (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }

      const foundStudent = rows[0];

      // delete the cookie if the student is already logged out
      if (!foundStudent) {
        res.clearCookie("jwt", { httpOnly: true });
        return res.status(200).json({ message: "Logged out successfully" });
      }

      //delete the refreshtoken from the database
      const sql = `update STUDENT set RefreshToken = ? where Email = ?`;
      db.run(sql, [null, foundStudent.Email], (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        }
      });
      res.clearCookie("jwt", { httpOnly: true });
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const handleStaffLogout = async (req, res) => {
  const RefreshToken = req.headers.authorization;
  //---------------------------------------------------------
  const sql = `select * from LECTURER where RefreshToken = ?`;
  try {
    db.all(sql, [RefreshToken], async (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }

      const foundStaff = rows[0];

      // delete the cookie if the staff is already logged out
      if (!foundStaff) {
        res.clearCookie("jwt", { httpOnly: true });
        return res.status(200).json({ message: "Logged out successfully" });
      }

      //delete the refreshtoken from the database
      const sql = `update LECTURER set RefreshToken = ? where Email = ?`;
      db.run(sql, [null, foundStaff.Email], (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        }
      });
      res.clearCookie("jwt", { httpOnly: true });
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const addStaff = async (req, res) => {
  const {
    First_name,
    Last_name,
    Department,
    Email,
    Picture_URL,
    Password,
    Position,
    Title,
  } = req.body;
  const sql = `insert into LECTURER(First_name, Last_name, Department, Email, Picture_URL, Password, Original_password, Position, Title) values(?,?,?,?,?,?,?,?,?)`;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    db.run(
      sql,
      [
        First_name,
        Last_name,
        Department,
        Email,
        Picture_URL,
        hashedPassword,
        Password,
        Position,
        Title,
      ],
      (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        } else {
          return res.json({
            message: "Student added successfully",
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

const getStaffByEmail = (req, res) => {
  const { Email } = req.params;
  const sql = `select Email from LECTURER where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
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

const getStaffDetailsByEmail = (req, res) => {
  const { Email } = req.params;
  const sql = `select Email, First_name, Last_name, Department, Picture_URL, Title, Position from LECTURER where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
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

const updateStudentPassword = async (req, res) => {
  const { Email, Password } = req.body;
  const sql = `update STUDENT set Password = ? where Email = ?`;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    db.run(sql, [hashedPassword, Email], (err) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json({
          message: "Password updated successfully",
        });
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const updateStaffPassword = async (req, res) => {
  const { Email, Password } = req.body;
  const sql = `update LECTURER set Password = ?, Original_password = ? where Email = ?`;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    db.run(sql, [hashedPassword, Password, Email], (err) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json({
          message: "Password updated successfully",
        });
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const deleteStudent = (req, res) => {
  const { Reg_number } = req.body;
  const sql = `DELETE from STUDENT where Reg_number = ?`;
  try {
    db.run(sql, [Reg_number], (err) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json({
          message: "Student deleted successfully",
        });
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const getStudentDetails = (req, res) => {
  const { department, year, regNumber } = req.params;
  const Reg_number = `${department}/${year}/${regNumber}`;
  const sql = `select First_name, Last_name, Department, Email, Batch from STUDENT where Reg_number = ?`;
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

const addTempUser = (req, res) => {
  const { Email, Verification_Code, First_Name, Last_Name, Picture_URL } =
    req.body;
  const sql = `insert into TEMP_USER(Email, Verification_Code, First_Name, Last_Name, Picture_URL) values(?,?,?,?,?)`;
  try {
    db.run(
      sql,
      [Email, Verification_Code, First_Name, Last_Name, Picture_URL],
      (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        } else {
          return res.json({
            message: "User added successfully",
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

const getAllTempUsers = (req, res) => {
  const sql = `select Email from TEMP_USER`;
  try {
    db.all(sql, [], (err, rows) => {
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

const getTempUserByID = (req, res) => {
  const { Email } = req.params;
  const sql = `select Email, Verification_code, Verified from TEMP_USER where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
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

const getTempUserPasscode = (req, res) => {
  const { Email } = req.params;
  const sql = `select Verification_Code from TEMP_USER where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.sendStatus(500).json(err.message);
  }
};

const updateVerificationCode = (req, res) => {
  const { Email, Verification_Code } = req.body;
  const sql = `update TEMP_USER set Verification_Code = ? where Email = ?`;
  try {
    db.run(sql, [Verification_Code, Email], (err) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json({
          message: "Verification code updated successfully",
        });
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

const deleteTempUser = (req, res) => {
  const { Email } = req.params;
  const sql = `delete from TEMP_USER where Email = ?`;
  try {
    db.run(sql, [Email], (err) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json({
          message: "User deleted successfully",
        });
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

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

const getStd = (Reg_number) => {
  const sql = `SELECT * FROM STUDENT WHERE Reg_number = ?`;
  return new Promise((resolve, reject) => {
    db.all(sql, [Reg_number], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getStaff = (Email) => {
  const sql = `SELECT * FROM LECTURER WHERE Email = ?`;
  return new Promise((resolve, reject) => {
    db.all(sql, [Email], (err, rows) => {
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

const changeStaffImg = (req, res) => {
  const { Email, Picture_URL } = req.body;
  const sql = `update LECTURER set Picture_URL = ? where Email = ?`;
  try {
    db.run(sql, [Picture_URL, Email], (err) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json({
          message: "Image updated successfully",
        });
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
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

const updateStudent = (req, res) => {
  const { First_name, Last_name, Department, Batch, Reg_number } = req.body;
  const sql = `update STUDENT set First_name = ?, Last_name = ?, Department = ?, Batch = ? where Reg_number = ?`;
  try {
    db.run(
      sql,
      [First_name, Last_name, Department, Batch, Reg_number],
      (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        } else {
          return res.json({
            message: "Student updated successfully",
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

const updateStaff = (req, res) => {
  const { First_name, Last_name, Department, Position, Title, Email } =
    req.body;
  const sql = `update LECTURER set First_name = ?, Last_name = ?, Department = ?, Position = ?, Title = ? where Email = ?`;
  try {
    db.run(
      sql,
      [First_name, Last_name, Department, Position, Title, Email],
      (err) => {
        if (err) {
          return res.json({
            message: "Error",
          });
        } else {
          return res.json({
            message: "Staff updated successfully",
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

module.exports = {
  getStudents,
  addStudent,
  addTempUser,
  getAllTempUsers,
  getTempUserByID,
  deleteTempUser,
  updateVerificationCode,
  deleteStudent,
  getStaffList,
  addStaff,
  getStaffDetailsByEmail,
  handleStdLogin,
  handleStdRefreshToken,
  handleStdLogout,
  addAppointment,
  getStudentRegNumber,
  getAppointmentCount,
  getAllAppointments,
  getLastAppointment,
  updateAppointment,
  deleteAppointment,
  handleStaffLogin,
  getStaffByEmail,
  handleStaffLogout,
  getStaffPassword,
  getStudentDetails,
  getAppointment,
  getAllConfirmedAppointments,
  handleStaffRefreshToken,
  acceptAppointment,
  getTempUserPasscode,
  getStudentByEmail,
  addBlockTimeSlot,
  getDepartmentStaff,
  deleteAppointmentByEmail,
  getStudentAppointments,
  updateStudentPassword,
  updateStaffPassword,
  updateStudent,
  updateStaff,
};
