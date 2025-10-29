import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/speakers", async (req, res) => {
  try {
    const url = "https://slush.org/audience/speakers";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const speakers = [];

    $(".team_item-copy").each((_, el) => {
      const name = $(el)
        .find(".text-size-large.text-weight-medium")
        .text()
        .trim();
      const img = $(el).find("img.speaker_image").attr("src");
      if (name && img) speakers.push({ name, img });
    });

    res.json(speakers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Parsing failed" });
  }
});

app.listen(4000, () => console.log("Server started on port 4000"));
