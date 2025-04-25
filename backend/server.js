import express from 'express';
import multer from 'multer';
import cors from 'cors';
import axios from 'axios';
import cheerio from 'cheerio';
import { getAiResponse } from './services/lang_chain.js';

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Root route
app.get('/', (req, res) => {
  res.send("working");
});

// Fetch image from Bing
app.get('/fetch-image', async (req, res) => {
  const { query } = req.query;

  try {
    const searchURL = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchURL);
    const $ = cheerio.load(data);
    const firstImageElement = $('.mimg').first();
    const firstImageURL = firstImageElement.attr('src');

    if (!firstImageElement.length || !firstImageURL) {
      throw new Error('No image found or missing src attribute.');
    }

    const finalURL = firstImageURL.startsWith('/')
      ? `https://www.bing.com${firstImageURL}`
      : firstImageURL;

    res.send({ imageURL: finalURL });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// AI response route
app.post('/', upload.single('file'), async (req, res) => {
  let { country } = req.body;

  if (country && country.length > 0) {
    country = "Give Ayurvedic Suggestions for " + country;
  }

  try {
    const response = await getAiResponse(country);
    console.log("server_res", response);
    res.status(201).json(response);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Start server
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
