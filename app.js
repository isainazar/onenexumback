var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cors = require("cors");
const initDB = require("./utilities/initDB");
const passport = require("passport");
require("./passport")(passport);
const session = require("express-session");
var cookieSession = require("cookie-session");
const URL = process.env.URL;
const URL2 = process.env.URL2;
const URL3 = process.env.URL3;
const URL4 = process.env.URL4;
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
const analyticsRouter = require("./routes/analyticsRouter");
const espacioPersonalRouter = require("./routes/espacioPersonalRoutes");
const favsRoutes = require("./routes/favRoutes");

var app = express();

app.use(
  cors({
    origin: [`${URL}`, `${URL2}`, `${URL3}`, `${URL4}`],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    // exposedHeaders: ["set-cookie"],
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "http://10.0.0.73:3002");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, X-Forwarded-Proto ,Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, X-Login, X-Date, X-Trans-Key, X-Content-Type, X-Version, Set-Cookie, set-cookie"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE"
  );
  res.setHeader("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});
const oneDay = 1000 * 60 * 60 * 24;
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.APP_NEXUM,
    resave: false,
    saveUninitialized: false,
    name: "cookienexum",
    //proxy: false,
    cookie: {
      maxAge: oneDay,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    },
  })
);

app.use(passport.initialize());
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
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/user", userRouter);
app.use("/api/favs", favsRoutes);
app.use("/api/verify", verifyRouter);
app.use("/api/contact", contactRouter);
app.use("/api/daily", dailyRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/admin", adminRouter);
app.use("/api/progress", progressRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/espacios", espacioPersonalRouter);

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});
app.get("*", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

conn
  .sync({
    force: false,
  })
  .then(() => {
    app.listen(3000, async () => {
      console.log("%s listening at http://localhost:3000");
      await initDB();
    });
  });

module.exports = app;
