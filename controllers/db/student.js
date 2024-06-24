const db = require("../../database/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getStudents = (req, res) => {
  const sql = `select Email from STUDENT`;
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

module.exports = {
  getStudents,
  getStudentByEmail,
  addStudent,
  deleteStudent,
  handleStdLogin,
  handleStdRefreshToken,
  handleStdLogout,
  getStudentRegNumber,
  getStudentDetails,
  updateStudentPassword,
  updateStudent,
};