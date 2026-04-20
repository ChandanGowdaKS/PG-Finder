const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const questionSchema = new Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    askedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    answer: {
        type: String,
        default: "",
        trim: true,
    },
    answeredBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });


const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    questions: [questionSchema],
}, {
    timestamps: true,
});

// Create indexes for faster querying
listingSchema.index({ location: 1 });
listingSchema.index({ country: 1 });
listingSchema.index({ owner: 1 });
listingSchema.index({ createdAt: -1 });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;