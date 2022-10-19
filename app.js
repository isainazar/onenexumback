var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const passport = require("passport");
require("./passport")(passport);
const session = require("express-session");
require("dotenv").config();
const { conn } = require("./DataBase/index.js");
const userRouter = require("./routes/userRoutes");
const verifyRouter = require("./routes/verifyRoutes");
const contactRouter = require("./routes/contactRoutes");
const dailyRouter = require("./routes/dailyRouter");
const quizRouter = require("./routes/quizRouter");
const adminRouter = require("./routes/adminRouter");
const progressRouter = require("./routes/progressRoutes");
const stripeRouter = require("./routes/stripeRouter");

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

app.use(
  session({
    secret: process.env.APP_NEXUM,
    resave: false,
    saveUninitialized: true,
  })
);

/* app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",

  passport.authenticate("auth-google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    session: false,
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("auth-google"),
  (req, res) => {
    console.log(req);
    //req.isAuthenticated() will return true if user is logged in
    res.redirect("http://localhost:3002/landing");
  }
); */

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/user", userRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/contact", contactRouter);
app.use("/api/daily", dailyRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/admin", adminRouter);
app.use("/api/progress", progressRouter);
app.use("/api/stripe", stripeRouter);

app.get("/ruta_solo_logueados", (req, res) => {
  console.log(req.session);

  // Si, por ejemplo, no hay nombre
  if (!req.session.nombre) {
    res.end("No tienes permiso. Fuera de aquí");
  } else {
    // Ok, el usuario tiene permiso
    res.end("Hola " + req.session.nombre);
  }
});

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
