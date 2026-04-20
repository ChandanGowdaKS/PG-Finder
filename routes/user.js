const express = require("express");
const router = express.Router();
const User = require("../models/user");
const WrapAsync = require("../utils/WrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSiginupPage)
.post(WrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginPage)
.post(saveRedirectUrl, passport.authenticate("local",
    { failureRedirect: "/login", failureFlash: true, }),
   userController.login);


router.get("/logout", userController.logout);
router.get("/profile/me", isLoggedIn, userController.profileMe);
router.get("/users/:id", WrapAsync(userController.showProfile));

module.exports = router;