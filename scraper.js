const puppeteer = require('puppeteer');
require('dotenv').config()
const geminiKey = process.env.geminiKey;
const pdf = require('pdf-parse');
const { getSubtitles } = require('youtube-captions-scraper');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(geminiKey);

async function scrapeAndScribev2(prompt, page, descriptionText, pdfData, choice) {
  prompt+=' in simple text (no special formatting)';
  try {
        let content;
        if(choice == 1) {
          let pageData = await pageContent(page);
          pageData = pageData.replace(/(^[ \t]*\n)/gm, "");
          content = "From the following data: " + pageData + " " + prompt;
        }
        if(choice == 2) {
          content = "From the following YouTube video data: " + descriptionText + " " + prompt;
        }
        if(choice == 3) {
          content = "From the following data from a PDF file: " + pdfData + " " + prompt;
        }
        const generationConfig = {
          temperature: 0.7,
        };
        const safetySettings = [{
          "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          "threshold": "BLOCK_NONE"
          },
          {
          "category": "HARM_CATEGORY_HATE_SPEECH",
          "threshold": "BLOCK_NONE"
          },
          {
          "category": "HARM_CATEGORY_HARASSMENT",
          "threshold": "BLOCK_NONE"
          },
          {
          "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
          "threshold": "BLOCK_NONE"
        }];
        const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig, safetySettings});
        const result = await model.generateContent(content);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (err) {
      return err;
    }
}
async function launchScraper(url, prompt) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);
  try {
    const response = await scrapeAndScribev2(prompt, page, null, null, 1);
    return response;
  } catch (error) {
    return error; 
  } finally {
    await browser.close();
  }
}
async function videoTranscriptPrompt(url, prompt) {
  try {
    let videoId = extractVideoId(url);
    const subtitles = await getSubtitles({
      videoID: videoId,
      lang: 'en'
    });
    let cumulatedText = subtitles.map(subtitle => subtitle.text).join(' ');
    const response = await scrapeAndScribev2(prompt, null, cumulatedText, null, 2);
    return response;
  } catch (err) {
    return err;
  }
}

const parsePDF = async (data) => {
  const pdfData = await pdf(data); 
  return pdfData.text;
};

const examinePdf = async (req) => {
  try {
    const data = req.file.buffer;
    const text = await parsePDF(data);
    let res = await scrapeAndScribev2(req.body.prompt, null, null, text, 3);
    console.log("Response from prompt processing:", res);
    return res;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  }
};

function extractVideoId(url) {
  const regex = /v=([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function pageContent(page) {
  const extractedText = await page.$eval('*', (el) => el.innerText);
  return extractedText;
}


module.exports = {
  launchScraper,
  videoTranscriptPrompt, 
  examinePdf
}
