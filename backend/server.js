import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/speakers", async (req, res) => {
  try {
    const { data } = await axios.get("https://example.com/speakers");
    const $ = cheerio.load(data);
    const speakers = [];

    $(".speaker-card").each((_, el) => {
      const name = $(el).find(".name").text().trim();
      const bio = $(el).find(".bio").text().trim();
      let img = $(el).find("img").attr("src");
      if (img && !img.startsWith("http")) img = "https://example.com" + img;
      speakers.push({ name, bio, img });
    });

    res.json(speakers);
  } catch (err) {
    res.status(500).json({ error: "Ошибка парсинга", details: err.message });
  }
});

app.listen(4000, () => console.log("Server started on port 4000"));
