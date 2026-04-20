const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.renderSiginupPage = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "welcome to Wanderlust");
            res.redirect("/listings");
        })
        
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginPage = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
};

module.exports.profileMe = (req, res) => {
    res.redirect(`/users/${req.user._id}`);
};

module.exports.showProfile = async (req, res) => {
    const { id } = req.params;
    const profileUser = await User.findById(id);

    if (!profileUser) {
        req.flash("error", "User not found");
        return res.redirect("/listings");
    }

    const userListings = await Listing.find({ owner: id }).sort({ createdAt: -1 });
    const userReviews = await Review.find({ author: id }).sort({ createdAt: -1 });

    res.render("users/profile.ejs", {
        profileUser,
        userListings,
        userReviews,
        isOwnerProfile: req.user && String(req.user._id) === String(profileUser._id),
    });
};