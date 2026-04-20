const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

main().then(() => {
    console.log("DB connected");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Wanderlust');
};

const initDB = async () => {
    await listing.deleteMany({});
    initData.data.map((obj) => ({...obj, owner: '69b440c41308975b33d41e75' }));
    await listing.insertMany(initData.data);
    console.log("data is initialized");
};

initDB();
