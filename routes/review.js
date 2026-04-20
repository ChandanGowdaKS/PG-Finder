const express = require("express");
const router = express.Router({mergeParams : true});
const listing = require("../models/listing.js");
const WrapAsync = require("../utils/WrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const {isLoggedIn,validateReview,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js")



// review route
router.post("/", isLoggedIn,validateReview, WrapAsync(reviewController.createReview));

// Delete review route
router.delete("/:reviewId", isLoggedIn,isReviewAuthor,WrapAsync(reviewController.destroyReview));

module.exports = router;