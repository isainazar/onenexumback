var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
const { conn } = require("./DataBase/index.js");
const userRouter = require("./routes/userRoutes");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, X-Login, X-Date, X-Trans-Key, X-Content-Type, X-Version"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE"
  );
  res.setHeader("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});
app.get("*", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

conn
  .sync({
    force: true,
  })
  .then(() => {
    app.listen(3000, async () => {
      console.log("%s listening at http://localhost:3000");
      /* await initDB(); */
    });
  });

module.exports = app;
