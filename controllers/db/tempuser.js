const db = require("../../database/database");
require("dotenv").config();

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

module.exports = {
  addTempUser,
  getAllTempUsers,
  getTempUserByID,
  deleteTempUser,
  updateVerificationCode,
  getTempUserPasscode,
};