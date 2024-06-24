const db = require("../../database/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

const deleteStaff = (req, res) => {
  const { Email } = req.body;
  const sql = `delete from LECTURER where Email = ?`;
  try {
    db.run(sql, [Email], (err) => {
      if (err) {
        return res.json({
          message: "Error",
        });
      } else {
        return res.json({
          message: "Staff deleted successfully",
        });
      }
    });
  } catch (err) {
    return res.json({
      message: "Error",
    });
  }
};

module.exports = {
  changeStaffImg,
  deleteStaff,
  getStaffList,
  addStaff,
  getStaffDetailsByEmail,
  handleStaffLogin,
  getStaffByEmail,
  handleStaffLogout,
  getStaffPassword,
  handleStaffRefreshToken,
  getDepartmentStaff,
  updateStaffPassword,
  updateStaff,
};