const express = require("express");
const app = express();
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const mongoose = require("mongoose");
const csrf = require("csurf");

const listing = require("./models/listing.js");
const path = require("node:path");
const methodOverride = require("method-override");   
const ejsMate = require("ejs-mate");
const WrapAsync = require("./utils/WrapAsync");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED PROMISE REJECTION:", err);
});

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// middlewares
const { validationListing, } = require("./middleware.js");

// mongo atlas key
const dbUrl = (process.env.ATLASDB_URL || "").trim();
if (!dbUrl) {
    throw new Error("ATLASDB_URL is missing in environment variables");
}

const localDbUrl = (process.env.LOCAL_MONGODB_URL || "mongodb://127.0.0.1:27017/Wanderlust").trim();

const isProduction = process.env.NODE_ENV === "production";
const allowInvalidTlsFromEnv = process.env.MONGO_TLS_ALLOW_INVALID_CERTS === "true";
const allowInvalidTls = allowInvalidTlsFromEnv || !isProduction;
const buildMongoOptions = (relaxTls = false) => ({
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    ...(relaxTls ? {
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
    } : {}),
});

if (!isProduction && allowInvalidTls) {
    console.warn("Warning: Mongo TLS cert validation is relaxed in development.");
}

const connectDatabase = async () => {
    mongoose.connection.on("error", (err) => {
        console.error("MONGOOSE CONNECTION ERROR:", err);
    });

    try {
        await mongoose.connect(dbUrl, buildMongoOptions(allowInvalidTls));
        console.log("DB connected");
        return mongoose.connection.getClient();
    } catch (err) {
        console.error("MONGOOSE INITIAL CONNECTION FAILED:", err.message);

        if (!isProduction) {
            console.warn(`Retrying with local MongoDB at ${localDbUrl}`);
            await mongoose.connect(localDbUrl, buildMongoOptions(true));
            console.log("Local DB connected");
            return mongoose.connection.getClient();
        }

        throw err;
    }
};

const mongooseConnectionPromise = connectDatabase();
 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    clientPromise: mongooseConnectionPromise,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // 24hours
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());

// Express 5-safe sanitizer for body/params to mitigate NoSQL operator injection.
const sanitizeObject = (input) => {
    if (Array.isArray(input)) {
        return input.map(sanitizeObject);
    }

    if (input && typeof input === "object") {
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            if (key.startsWith("$") || key.includes(".")) {
                continue;
            }
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }

    return input;
};

app.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
    }

    if (req.params && typeof req.params === "object") {
        req.params = sanitizeObject(req.params);
    }

    next();
});

// CSRF protection - must be after session middleware
const csrfProtection = csrf({ cookie: false });
app.use((req, res, next) => {
    if (req.is("multipart/form-data")) {
        return next();
    }
    return csrfProtection(req, res, next);
});

// passport for user authentication   // pbkdf2 hashing algorithm
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.deleted = req.flash("deleted"); 
    res.locals.error = req.flash("error"); 
    res.locals.currUser = req.user;
    res.locals.csrfToken = typeof req.csrfToken === "function" ? req.csrfToken() : "";
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});





// listings route in route folder
app.use("/listings",listingRouter)


// listings of review in route folder

app.use("/listings/:id/reviews", reviewRouter);

// user router

app.use("/", userRouter);

// error handling for not found pages
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});


//custom middleware to handle error
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        req.flash("error", "Invalid request token. Please try again.");
        return res.redirect("back");
    }

    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message }); 
});

const startServer = async () => {
    await mongooseConnectionPromise;

    app.listen(3000, () => {
        console.log("3000 port is listening");
    });
};

startServer().catch((err) => {
    console.error("FAILED TO START APPLICATION:", err);
    process.exit(1);
});