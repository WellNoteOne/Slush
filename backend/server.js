// backend/server.js
import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import mongoose from "mongoose";
import Speaker from "./Models/speaker.js";

const app = express();
app.use(cors());

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://valek99mail_db_user:6WuexPh43uGk21vT@db0ne.46iejf7.mongodb.net/";
await mongoose.connect(MONGO_URI);
console.log("Connected to MongoDB");

function absoluteUrl(href) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  return new URL(href, "https://slush.org").toString();
}

async function scrapeSpeakers() {
  try {
    const listUrl = "https://slush.org/audience/speakers";
    const { data } = await axios.get(listUrl);
    const $ = cheerio.load(data);

    const items = $(".team_item-copy").toArray();
    const speakers = [];

    for (const el of items) {
      try {
        const $el = $(el);
        const name = $el
          .find(".text-size-large.text-weight-medium")
          .text()
          .trim();
        const img = $el.find("img.speaker_image").attr("src") || null;

        const title = $el
          .find(".text-color-secondary-copy")
          .first()
          .text()
          .trim();
        const company = $el
          .find(".text-color-secondary.text-weight-medium")
          .first()
          .text()
          .trim();
        const bio = [title, company].filter(Boolean).join(" at ");

        const href =
          $el.find("a.w-inline-block").attr("href") ||
          $el.find("a").attr("href");
        const profileUrl = absoluteUrl(href);
        console.log("TITLE:", title);
        console.log("COMPANY:", company);
        let description = "";

        if (profileUrl) {
          await new Promise((r) => setTimeout(r, 300));

          try {
            const { data: profileHtml } = await axios.get(profileUrl);
            const $$ = cheerio.load(profileHtml);

            const descParagraphs = $$(
              ".about_mission_content-left .text-size-medium-1-1"
            )
              .toArray()
              .map((p) => $$(p).text().trim())
              .filter(Boolean);

            if (descParagraphs.length === 0) {
              const alt = $$(".about_mission_content .text-size-medium-1-1")
                .toArray()
                .map((p) => $$(p).text().trim())
                .filter(Boolean);
              if (alt.length) description = alt.join("\n\n");
            } else {
              description = descParagraphs.join("\n\n");
            }

            if (!description) {
              const alt2 = $$(".about_mission_content p")
                .toArray()
                .map((p) => $$(p).text().trim())
                .filter(Boolean);
              description = alt2.join("\n\n");
            }
          } catch (errProfile) {
            console.warn(
              `Not possible to get a profile ${profileUrl}: ${errProfile.message}`
            );
          }
        }

        const speakerObj = { name, img, bio, description, profileUrl };
        speakers.push(speakerObj);
      } catch (errItem) {
        console.warn("Error:", errItem.message);
      }
    }

    await Speaker.deleteMany({});
    if (speakers.length) await Speaker.insertMany(speakers);

    console.log(`Updated ${speakers.length} speakers`);
    return { count: speakers.length };
  } catch (err) {
    console.error("Parsing error:", err.message);
    throw err;
  }
}

app.get("/api/scrape", async (req, res) => {
  try {
    const result = await scrapeSpeakers();
    res.json({ message: "Speakers updated", ...result });
  } catch {
    res.status(500).json({ error: "Parsing failed" });
  }
});

app.get("/api/speakers", async (req, res) => {
  const speakers = await Speaker.find();
  res.json(speakers);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server fly on port ${PORT}`));

// --- KEEP SERVER AWAKE ON RENDER ---
if (process.env.RENDER === "true") {
  const fetch = (await import("node-fetch")).default;

  setInterval(() => {
    fetch("https://slush-c3qw.onrender.com/api/speakers")
      .then(() => console.log("🟢 Keep-alive ping sent"))
      .catch(() => console.log("⚠️ Keep-alive ping failed"));
  }, 10 * 60 * 1000);
}
