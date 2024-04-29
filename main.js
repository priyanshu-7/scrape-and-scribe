const express = require('express');
const { launchScraper, videoTranscriptPrompt, examinePdf } = require('./scraper.js');
const cors = require('cors');
const multer = require('multer');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/summarize-pdf', upload.single('file'), async (req, res) => {
  try {
    const response = await examinePdf(req);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

app.post('/summarize-video', async (req, res) => {
  console.log("Received body:", req.body);
  const { url, prompt } = req.body;
  if (!url) {
      console.error("URL is missing in the request body.");
      return res.status(400).send("URL is required.");
  }
  try {
      let response = await videoTranscriptPrompt(url, prompt?prompt:' Give me a summary of this video');
      console.log("Video summarization response:", response);
      res.json(response);
  } catch (error) {
      console.error("Error during video summarization:", error);
      res.status(500).send("An error occurred while summarizing the video.");
  }
});

app.post('/summarize-url', async (req, res) => {
  console.log("Received body:", req.body);
  const { url, prompt } = req.body;
  if (!url) {
      console.error("URL is missing in the request body.");
      return res.status(400).send("URL is required.");
  }
  try {
      let response = await launchScraper(url, prompt?prompt:' Summarize this page');
      console.log("Video summarization response:", response);
      res.json(response);
  } catch (error) {
      console.error("Error during URL summarization:", error);
      res.status(500).send("An error occurred while summarizing the video.");
  }
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
