const listing = require("../models/listing");
const Review = require("../models/review");

const updateListingAverageRating = async (listingDoc) => {
    if (!listingDoc) {
        return;
    }

    const reviewIds = listingDoc.reviews || [];

    if (!reviewIds.length) {
        listingDoc.averageRating = 0;
        await listingDoc.save();
        return;
    }

    const ratingRows = await Review.find({ _id: { $in: reviewIds } }).select("rating");
    const total = ratingRows.reduce((acc, row) => acc + (row.rating || 0), 0);
    listingDoc.averageRating = Number((total / ratingRows.length).toFixed(1));
    await listingDoc.save();
};

module.exports.createReview = async (req, res) => {
    let list = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    list.reviews.push(newReview);
    req.flash("success", " New review added Successfully");
    await newReview.save();
    await list.save();
    await updateListingAverageRating(list);
    
    res.redirect(`/listings/${list._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    const list = await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { new: true });
    await Review.findByIdAndDelete(reviewId);
    await updateListingAverageRating(list);
    req.flash("success", "Review deleted Successfully");
    res.redirect(`/listings/${id}`);
};