const listing = require("../models/listing");
const User = require("../models/user");

const DEFAULT_LIMIT = 12;

const SORT_MAP = {
    recommended: { location: 1, title: 1 },
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { averageRating: -1 },
};

const parseOptionalNumber = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const buildSearchRegex = (value) => {
    const escapedValue = value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\\$&`);
    return new RegExp(escapedValue, "i");
};

const buildFilters = (req) => {
    return {
        location: (req.query.location || "").trim(),
        sortBy: req.query.sort || "recommended",
        minPrice: parseOptionalNumber(req.query.minPrice),
        maxPrice: parseOptionalNumber(req.query.maxPrice),
        country: (req.query.country || "").trim(),
        minRating: parseOptionalNumber(req.query.minRating),
        page: Math.max(Number.parseInt(req.query.page, 10) || 1, 1),
    };
};

const buildQuery = (filters) => {
    const query = {};

    if (filters.location) {
        const locationRegex = buildSearchRegex(filters.location);
        query.$or = [
            { title: locationRegex },
            { location: locationRegex },
            { country: locationRegex },
        ];
    }

    if (filters.minPrice !== null || filters.maxPrice !== null) {
        const priceQuery = {};
        if (filters.minPrice !== null) {
            priceQuery.$gte = filters.minPrice;
        }
        if (filters.maxPrice !== null) {
            priceQuery.$lte = filters.maxPrice;
        }
        if (Object.keys(priceQuery).length) {
            query.price = priceQuery;
        }
    }

    if (filters.country) {
        query.country = filters.country;
    }

    if (filters.minRating !== null) {
        query.averageRating = { $gte: filters.minRating };
    }

    return query;
};

const normalizeCountries = (values) => {
    return values
        .filter((item) => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim())
        .sort((a, b) => a.localeCompare(b));
};

const renderFilterValues = (filters) => {
    return {
        minPrice: filters.minPrice ?? "",
        maxPrice: filters.maxPrice ?? "",
        country: filters.country,
        minRating: filters.minRating ?? "",
    };
};

module.exports.index = async (req, res, next) => {
    const filters = buildFilters(req);
    const query = buildQuery(filters);
    const countries = normalizeCountries(await listing.distinct("country"));
    const totalListings = await listing.countDocuments(query);
    const totalPages = Math.max(Math.ceil(totalListings / DEFAULT_LIMIT), 1);
    const currentPage = Math.min(filters.page, totalPages);
    const allListings = await listing.find(query)
        .sort(SORT_MAP[filters.sortBy] || SORT_MAP.recommended)
        .skip((currentPage - 1) * DEFAULT_LIMIT)
        .limit(DEFAULT_LIMIT);

    let favoriteIds = [];
    if (req.user) {
        const userWithFavorites = await User.findById(req.user._id).select("favorites").lean();
        favoriteIds = (userWithFavorites?.favorites || []).map(String);
    }

    res.render("listings/index", {
        allListings,
        searchLocation: filters.location,
        sortBy: filters.sortBy,
        filters: renderFilterValues(filters),
        countries,
        pagination: {
            currentPage,
            totalPages,
            totalListings,
            limit: DEFAULT_LIMIT,
        },
        favoriteIds,
    });
};

module.exports.count = async (req, res) => {
    const filters = buildFilters(req);
    const query = buildQuery(filters);
    const totalListings = await listing.countDocuments(query);
    res.json({ totalListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/newList.ejs");
};

module.exports.createNewListing = async (req, res, next) => {
    const newListing = new listing(req.body.listing);
    
    newListing.owner = req.user._id;
    if (req.file) {
        newListing.image = {
            url: req.file.secure_url || req.file.url,
            filename: req.file.filename || req.file.public_id,
        };
    }

    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}; 

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    let list = await listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner")
        .populate("questions.askedBy")
        .populate("questions.answeredBy");
    if (!list) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    };
    let isFavorited = false;
    if (req.user) {
        const userWithFavorites = await User.findById(req.user._id).select("favorites").lean();
        isFavorited = (userWithFavorites?.favorites || []).some((favId) => String(favId) === String(list._id));
    }

    res.render("listings/show.ejs", { list, isFavorited });
};

module.exports.createQuestion = async (req, res) => {
    const { id } = req.params;
    const rawQuestion = req.body?.question?.text || "";
    const questionText = rawQuestion.trim();

    if (!questionText) {
        req.flash("error", "Question cannot be empty");
        return res.redirect(`/listings/${id}`);
    }

    const list = await listing.findById(id);
    if (!list) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }

    list.questions.unshift({
        question: questionText,
        askedBy: req.user._id,
    });

    await list.save();
    req.flash("success", "Question posted");
    res.redirect(`/listings/${id}`);
};

module.exports.answerQuestion = async (req, res) => {
    const { id, questionId } = req.params;
    const rawAnswer = req.body?.question?.answer || "";
    const answerText = rawAnswer.trim();

    if (!answerText) {
        req.flash("error", "Answer cannot be empty");
        return res.redirect(`/listings/${id}`);
    }

    const list = await listing.findById(id);
    if (!list) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }

    const question = list.questions.id(questionId);
    if (!question) {
        req.flash("error", "Question not found");
        return res.redirect(`/listings/${id}`);
    }

    question.answer = answerText;
    question.answeredBy = req.user._id;
    await list.save();

    req.flash("success", "Answer posted");
    res.redirect(`/listings/${id}`);
};

module.exports.toggleFavorite = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const targetListing = await listing.findById(id);

    if (!targetListing) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }

    const hasFavorite = user.favorites.some((favId) => String(favId) === String(id));

    if (hasFavorite) {
        user.favorites = user.favorites.filter((favId) => String(favId) !== String(id));
        req.flash("success", "Removed from favorites");
    } else {
        user.favorites.push(id);
        req.flash("success", "Added to favorites");
    }

    await user.save();

    const redirectTo = req.body.returnTo || `/listings/${id}`;
    res.redirect(redirectTo);
};

module.exports.favoritesPage = async (req, res) => {
    const user = await User.findById(req.user._id).populate("favorites");
    const favoriteListings = user?.favorites || [];
    res.render("listings/favorites.ejs", { favoriteListings });
};
    
module.exports.editListingForm = async (req, res, next) => {
    let { id } = req.params;
    const editingList = await listing.findById(id);
    if (!editingList) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }
    
    res.render("listings/edit.ejs", { editingList });
};

module.exports.editListing = async (req, res, next) => {
    const { id } = req.params;

    const updatedListing = await listing.findById(id);
    if (!updatedListing) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }

    Object.assign(updatedListing, req.body.listing);

    await updatedListing.save();
    req.flash("success", " Listing edited Successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res, next) => {
    let { id } = req.params;
    const deletedList = await listing.findByIdAndDelete(id);
    if (!deletedList) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }
    req.flash("deleted", `${deletedList.title} listing deleted Successfully`);
    res.redirect("/listings");
};

