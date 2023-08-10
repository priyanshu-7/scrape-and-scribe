const puppeteer = require('puppeteer');
const creds = require('./creds.json');
const axios = require('axios');
const OPENAI_API_KEY = creds.apiKey;

async function click(xPath, page) {
  await page.waitForXPath(xPath, { visible: true });
  const [buttonElement] = await page.$x(xPath);
  await buttonElement.click();
}
async function input(xPath, text, page, delay = 100) {
  await page.waitForXPath(xPath, { visible: true });
  const [inputElement] = await page.$x(xPath);
  await inputElement.type(text, {delay});
}
async function getValues(xPath, page) {
  const elements = await page.$x(xPath); 
  for (const element of elements) {
    const titleText = await element.evaluate(el => el.textContent); 
    console.log(titleText);
  }
}
async function pageContent(page) {
  const extractedText = await page.$eval('*', (el) => el.innerText);
  return extractedText;
}
async function scrapeAndScribe(browser, prompt, page) {
  try {
    let pageData = await pageContent(page);
    pageData = pageData.replace(/(^[ \t]*\n)/gm, "");
    let content = "From the following data: " + pageData + " " + prompt;
    const data = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: content }],
      temperature: 0.7
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    };
    const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });    
    return response.data;
  } catch (error) {
    return error;
  }
}

async function launchScraper(url, prompt) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  try {
    const response = await scrapeAndScribe(browser, prompt, page);
    return response;
  } catch (error) {
    console.error(error);
    return error; 
  } finally {
    await browser.close();
  }
}


module.exports = {
  launchScraper
}
