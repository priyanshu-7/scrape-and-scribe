const puppeteer = require('puppeteer');
const creds = require('./creds.json');
const { getSubtitles } = require('youtube-captions-scraper');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(creds.geminiKey);

async function scrapeAndScribev2(browser, prompt, page, descriptionText) {
  try {
        let content;
        if(browser!=null && prompt!=null && page!=null && descriptionText == "") {
          let pageData = await pageContent(page);
          pageData = pageData.replace(/(^[ \t]*\n)/gm, "");
          content = "From the following data: " + pageData + " " + prompt;
        } else {
          content = "Analyze the content of a provided YouTube video transcript and summarize it. The summary should be structured for inclusion within an HTML container, such as a <div> element, focusing on what the video is about followed by a concise yet comprehensive summary. Please structure the summary using relevant HTML tags like <h1>, <p>, and <ul> for headings, paragraphs, and lists respectively. Ensure the summary captures all key details mentioned in the video: " + descriptionText;
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
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  try {
    const response = await scrapeAndScribev2(browser, prompt, page, "");
    return response;
  } catch (error) {
    return error; 
  } finally {
    await browser.close();
  }
}
async function videoTranscriptPrompt(url) {
  try {
    let videoId = extractVideoId(url);
    const subtitles = await getSubtitles({
      videoID: videoId,
      lang: 'en'
    });
    let cumulatedText = subtitles.map(subtitle => subtitle.text).join(' ');
    const response = await scrapeAndScribev2(null, null, null, cumulatedText);
    return response;
  } catch (err) {
    return err;
  }
}

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
  videoTranscriptPrompt
}
