const express = require("express");
const router = express.Router();
require("dotenv").config();
require("../passport");
const passport = require("passport");

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.clearCookie("session");
    res.clearCookie("session.sig");
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    res
      // .status(405)
      .json({ error: true, message: "Not Authorized", google: true });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Login failure",
    
  });
});

router.get(
  "/google",
  (req, res, next) => {
    // Store the action query parameter in the session
    req.session.authAction = req.query.action;
    next();
  },
  passport.authenticate("google", ["profile", "email"])
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/login/failed");

    req.logIn(user, (err) => {
      if (err) return next(err);

      // Determine the success redirect URL based on the session variable
      const authAction = req.session.authAction;
      let redirectUrl;
      if (authAction === "signup") {
        redirectUrl = `${process.env.CLIENT_URL}/signup`;
      } else {
        redirectUrl = `${process.env.CLIENT_URL}/`;
      }

      delete req.session.authAction; // Clear the session variable
      res.redirect(redirectUrl);
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

module.exports = router;
