const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoosePkg = require("passport-local-mongoose");
const passportLocalMongoose = passportLocalMongoosePkg.default || passportLocalMongoosePkg;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: "",
    },
    profileImage: {
        type: String,
        default: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    },
    favorites: [
        {
            type: Schema.Types.ObjectId,
            ref: "listing",
        },
    ],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

// pbkdf2 hashing algorithm