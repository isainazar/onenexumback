const { User } = require("./db/index");
require("dotenv").config();

// Autenticacion con Google
const GoogleStrategy = require("passport-google-oidc");

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_KEY,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "/auth/google/callback",
        profileFields: ["id", "displayName"],
      },
      async function (issuer, profile, done) {
        // vamos a la DB para buscar el usuario en base al profileId que proporciona google
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
          provider: issuer,
          username: " ",
          email: " ",
          password: " ",
        });
        // si no puede crearlo lanza error
        if (!userCreated) {
          return done(null, { message: "error creating user" });
        }
        // regresa usuario creado
        return done(null, userCreated);
      }
    )
  );
};
