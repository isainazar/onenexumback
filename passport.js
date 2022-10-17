const { User } = require("./DataBase/index");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
require("dotenv").config();

const { OAuth2Strategy } = require("passport-google-oauth");

// Autenticacion con Google

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(
    "auth-google",
    new OAuth2Strategy(
      {
        clientID: process.env.GOOGLE_KEY,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
        profileFields: ["id", "displayName"],
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async function (accessToken, refreshToken, issuer, profile, done) {
        // vamos a la DB para buscar el usuario en base al profileId que proporciona google
        console.log("profile", profile);
        console.log("issuer", issuer);
        console.log("refreshToken", refreshToken);
        console.log("accessToken", accessToken);

        const userDb = await User.findOne({
          where: { providerId: profile.id },
        });

        // si lo encuentra regresa el usuario encontrado
        if (userDb) {
          return done(null, userDb);
        }

        // si no lo encuentra crea un usuario nuevo en la DB
        const userCreated = await User.create({
          providerId: profile.id,
          provider: profile.provider,
          name: profile.name.givenName,
          lastname: profile.name.familyName,
          email: profile._json.email,
          password: " ",
          /*  gender: "",
          country: "",
          region: "",
          date_birth: "", */
        });

        // si no puede crearlo lanza error
        if (!userCreated) {
          return done(null, { message: "error creating user" });
        }
        const payload = {
          user: {
            id: userCreated.dataValues.id_user,
          },
        };

        jwt.sign(
          payload,
          JWT_SECRET,
          {
            expiresIn: "7d",
          },
          (err, token) => {
            if (err) {
              throw err;
            }
            req.session.token = token;
            res
              .status(201)
              .json({ token: token, id_user: userCreated.dataValues.id_user });
          }
        );
        // regresa usuario creado
        return done(null, userCreated);
      }
    )
  );
};
