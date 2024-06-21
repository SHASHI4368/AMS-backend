const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

/* When using proxy */

// const myProxy = "http://192.168.49.1:8282";
// const myProxy = "http://10.50.225.222:3128";

// var strategy = new GoogleStrategy(
//   {
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "/auth/google/callback",
//     scope: ["profile", "email"],
//   },
//   function (accessToken, refreshToken, profile, callback) {
//     callback(null, profile);
//   }
// );

// var {HttpsProxyAgent} = require("https-proxy-agent");
//   var proxy = new HttpsProxyAgent(myProxy);
//   strategy._oauth2.setAgent(proxy);

// passport.use(strategy);


/*When not using proxy*/
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, callback) {
      callback(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
