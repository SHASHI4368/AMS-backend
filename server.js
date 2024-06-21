require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");
const passportStrategy = require("./passport");
const authRoute = require("./routes/auth");
const mailRouter = require("./routes/mail");
const dbRouter = require("./routes/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["ams"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(passport.initialize());
app.use(passport.session());



app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: "GET, PUT, POST, DELETE",
  })
);

app.get("/clearCookies", (req, res) => {
  // Clear 'session' cookie
  res.clearCookie("session");
  // Clear 'session.sig' cookie
  res.clearCookie("session.sig");

  res.send("Cookies cleared successfully.");
});

app.use("/auth", authRoute);
app.use("/mail", mailRouter);
app.use("/db", dbRouter);

app.get("/db/students", (req, res) => {
  const sql = `select * from STUDENT`;
  try {
    db.all(sql, [], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("add appointment", (apt) => {
    io.emit("add appointment", apt); 
  });
  socket.on("block time slot", ()=>{
    io.emit("block time slot");
  })
  socket.on("delete appointment", (apt) => {
    io.emit("delete appointment", apt); 
  });

  socket.on("change appointment", (apt) => {
    io.emit("change appointment", apt); 
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Server up and running on port ${port} !`));
