# scrape-and-scribe
A webapp which integrates puppeteer and OpenAI API to make ChatGPT support external URLs
![Untitled design](https://github.com/priyanshu-7/scrape-and-scribe/assets/43825652/c5824c4b-9316-42ce-b256-81d9b2b8e1f2)

Setup
- npm install
- Get OpenAI keys and add them to creds.json
- Launch main.js
- Head to localhost:3000

Limitations 
- Sending a HUGE amount of text (i.e. web pages with massive amount of data) in the OpenAI request might return an error (tested with a free OpenAI credits)
- Certain web pages might return server errors.
- Not all the data might be available from scrollable URLs.
