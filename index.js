require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env["MONGO_URI"]);
const Url = require("./models/UrlModel");
const regex = require("./utils/urlValidator");

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  return res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", async function (req, res) {
  const { url } = req.body;

  // validate url
  if (!regex.test(url)) return res.json({ error: "invalid url" });

  // see if url already exist in the DB
  const exist = await Url.find({ original_url: url });
  if (exist.length > 0) {
    return res.json({
      original_url: exist[0].original_url,
      short_url: exist[0].short_url,
    });
  }

  // take the last record from the DB
  const lastRecord = await Url.find({}).sort({ _id: -1 }).limit(1);
  let shortUrl = 0;

  // // increment by one from the last record short_url
  if (lastRecord.length > 0) {
    shortUrl = Number(lastRecord[0].short_url) + 1;
  }

  const newUrl = new Url({
    original_url: url,
    short_url: shortUrl,
  });

  newUrl.save().then((response) => {
    return res.json({
      original_url: response.original_url,
      short_url: response.short_url,
    });
  });
});

app.get("/api/shorturl/:shorturl", async function (req, res) {
  const { shorturl } = req.params;
  const exist = await Url.find({ short_url: shorturl });

  if (exist.length > 0) {
    return res.redirect(exist[0].original_url);
  }

  return res.json({ error: "URL doesn't exist in the database" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
