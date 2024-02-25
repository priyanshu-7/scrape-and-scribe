const express = require('express');
const bodyParser = require('body-parser');
const { launchScraper, videoTranscriptPrompt } = require('./scraper.js')

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/youtube-summarizer', (req, res) => {
  res.sendFile(__dirname + '/public/youtube-summarizer-index.html');
});

app.post('/summarize-video', async(req, res) => {
  try {
    const url = req.body.url;
    let response = await videoTranscriptPrompt(url);
    console.log(response);
    const contentHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>YouTube Video Summary</title>
      <style>
        body, html {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          height: 100%;
          display: flex;
          flex-direction: column; 
        }
        
        .container {
          flex-grow: 1; 
          display: flex;
          flex-direction: column;
          justify-content: center; 
          align-items: center; 
          padding: 20px;
        }
    
        .back-button {
          margin: 20px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          background-color: #007bff;
          color: #ffffff;
          border: none;
          border-radius: 5px;
        }
    
        @media (max-width: 600px) {
          .container {
            padding: 10px; 
          }
    
          .back-button {
            font-size: 14px;
            padding: 8px 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Generated Result</h1>
        <p id="responseText">${response}</p>
        <button class="back-button" onclick="goBack()">Go Back</button>
      </div>
    
      <script>
        function goBack() {
          window.history.back();
        }
      </script>
    </body>
    </html>
  `;

  // Send the HTML page as the response
  res.send(contentHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
});


app.post('/submit', async(req, res) => {
  try {
    const url = req.body.url;
    const prompt = req.body.prompt;
    let response = await launchScraper(url, prompt);
    const contentHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Generated Result</title>
      <style>
        body, html {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          height: 100%;
          display: flex;
          flex-direction: column; 
        }
        
        .container {
          flex-grow: 1; 
          display: flex;
          flex-direction: column;
          justify-content: center; 
          align-items: center; 
          padding: 20px;
          text-align: center;
        }
    
        .back-button {
          margin: 20px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          background-color: #007bff;
          color: #ffffff;
          border: none;
          border-radius: 5px;
        }
    
        @media (max-width: 600px) {
          .container {
            padding: 10px; 
          }
    
          .back-button {
            font-size: 14px;
            padding: 8px 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Generated Result</h1>
        <p id="responseText">${response}</p>
        <button class="back-button" onclick="goBack()">Go Back</button>
      </div>
    
      <script>
        function goBack() {
          window.history.back();
        }
      </script>
    </body>
    </html>
  `;

  // Send the HTML page as the response
  res.send(contentHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
});



const port = 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
