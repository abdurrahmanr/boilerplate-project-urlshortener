const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: String,
});

module.exports = mongoose.model("Url", UrlSchema);
