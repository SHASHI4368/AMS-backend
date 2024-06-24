const {
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
} = require("../controllers/db/student");

const {
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
} = require("../controllers/db/staff");

const {
  addTempUser,
  getAllTempUsers,
  getTempUserByID,
  deleteTempUser,
  updateVerificationCode,
  getTempUserPasscode,
} = require("../controllers/db/tempuser");

const {
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
} = require("../controllers/db/appointment");

const dbRouter = require("express").Router();

const verifyJWT = require("../middlewares/verifyJWT");

// student routes
dbRouter.get("/students", getStudents);
dbRouter.post("/students", addStudent);
dbRouter.get("/student/details/:department/:year/:regNumber", getStudentDetails);
dbRouter.delete("/students/", deleteStudent);
dbRouter.get("/student/:Email", getStudentByEmail);
dbRouter.post("/student/login", handleStdLogin);
dbRouter.post("/student/refresh", handleStdRefreshToken);
dbRouter.get("/student/logout", handleStdLogout);
dbRouter.get("/student/regnumber/:Email", getStudentRegNumber);
dbRouter.get(
  "/student/appointments/:department/:year/:regNumber",
  getStudentAppointments
);
dbRouter.put("/student", updateStudent);
dbRouter.put("/student/password", updateStudentPassword);

// staff routes
dbRouter.get("/staffList", getStaffList);
dbRouter.get("/department/:Department", getDepartmentStaff);
dbRouter.post("/staff", addStaff);
dbRouter.post("/staff/login", handleStaffLogin);
dbRouter.get("/staff/logout", handleStaffLogout);
dbRouter.get("/staff/refresh", handleStaffRefreshToken);
dbRouter.get("/staff/:Email", getStaffByEmail);
dbRouter.get("/staff/details/:Email", getStaffDetailsByEmail);
dbRouter.get("/staff/password/:Email", getStaffPassword);
dbRouter.put("/staff", updateStaff);
dbRouter.put("/staff/password", updateStaffPassword);
dbRouter.delete("/staff/:Email", deleteStaff);
dbRouter.post("/staff/img", changeStaffImg);

// temp user routes
dbRouter.post("/tempUser", addTempUser);
dbRouter.get("/tempUsers", getAllTempUsers);
dbRouter.get("/tempUser/:Email", getTempUserByID);
dbRouter.delete("/tempUser/:Email", deleteTempUser);
dbRouter.put("/tempUser", updateVerificationCode);
dbRouter.get("/tempUser/passcode/:Email", getTempUserPasscode);

// appointment routes
dbRouter.get("/appointment/count/:Lecturer_mail", getAppointmentCount);
dbRouter.get("/appointment/last", getLastAppointment);
dbRouter.post("/appointment/add", addAppointment);
dbRouter.post("/appointment/block", addBlockTimeSlot);
dbRouter.get("/appointments/:Lecturer_mail", getAllAppointments);
dbRouter.get("/appointments/confirmed/:Lecturer_mail", getAllConfirmedAppointments);
dbRouter.put("/appointment", updateAppointment);
dbRouter.delete("/appointment/:Id", deleteAppointment);
dbRouter.get("/appointment/delete/:Id", deleteAppointmentByEmail);
dbRouter.get("/appointment/:Id", getAppointment);
dbRouter.get("/appointment/accept/:Id", acceptAppointment);


// dbRouter.use(verifyJWT);

module.exports = dbRouter;

// const sql = `alter table STUDENT drop column Password;`;
// const sql = `alter table STUDENT add column Password varchar(100) not null;`;
// const sql = `alter table LECTURER drop column Password;`;
// const sql = `alter table LECTURER add column Password varchar(100) not null;`;
// const sql = `alter table STUDENT drop column RefreshToken;`;
// const sql = `alter table STUDENT add column RefreshToken varchar(100);`;
// const sql = `alter table LECTURER add column RefreshToken varchar(100);`;
// const sql = `alter table LECTURER add column Position varchar(30) not null;`;
// const sql = `alter table LECTURER add column Title varchar(30) not null;`;
// const sql = `alter table APPOINTMENT add column Reason varchar(100);`;
// const sql = `

// create table STUDENT(
// 	Reg_number varchar(11) not null,
//     First_name varchar(20) not null,
//     Last_name varchar(20) not null,
//     Department varchar(30) not null,
//     Email varchar(30) not null,
//     Batch int not null,
//     Picture_URL varchar(100),
//     primary key(Reg_number)
// );


// const sql = `
// create table LECTURER(
// 	Email varchar(50) not null,
//     First_name varchar(20) not null,
//     Last_name varchar(20) not null,
//     Department varchar(30) not null,
// Position varchar(30) not null,
// Title varchar(30) not null,
//     Picture_URL varchar(100),
//     Password varchar(30) not null,
//     primary key(Email)
// );
//

// create table TEMP_USER(
// 	Email varchar(50) not null,
//     Verification_Code varchar(4) not null,
//     Picture_URL varchar(100),
//     First_Name varchar(50),
//     Last_Name varchar(50),
//     Verified boolean default false,
//     primary key(Email)
// );

// const sqlite = require("sqlite3").verbose();

// const sql = `drop table APPOINTMENT;`
// const sql = `create table APPOINTMENT(
// 	   Id int not null,
//     Lecturer_mail varchar(50) not null,
//     Student_reg varchar(11),
//     Subject varchar(200),
//     Description varchar(500),
//     StartTime varchar(100) not null,
//     EndTime varchar(100) not null,
//     Apt_status varchar(20) default "Pending",
//     primary key (Id),
//     foreign key(Lecturer_mail) references LECTURER(Email),
//     foreign key(Student_reg) references STUDENT(Reg_number)
// );`


// const db = new sqlite.Database("./ams.db", sqlite.OPEN_READWRITE, (err) => {
//   if (err) {
//     console.error(err.message);
//   } else {
//     console.log("Connected to the database.");
//   }
// });

// db.run(sql, (err) => {
//  if(err){
//   console.error(err.message);
//  }else{
//   console.log('Table created.');
//  }
// });
 
module.exports = dbRouter;
