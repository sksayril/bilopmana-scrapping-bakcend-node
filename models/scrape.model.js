const mongoose = require("mongoose");

const ScrapeResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    keyword: { type: String, required: true },
    data: { type: Array, required: true }, // Storing scraped results
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ScrapeResult", ScrapeResultSchema);
