const express = require('express');
const bodyParser = require('body-parser');
const creds = require('./creds.json');
const { launchScraper } = require('./scraper.js')

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/submit', async(req, res) => {
  try {
    const url = req.body.url;
    const prompt = req.body.prompt;
    let response = await launchScraper(url, prompt);
    const content = response.choices[0].message.content;
    const contentHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Generated Result</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        
        .container {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
          width: 400px;
        }
    
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
    
        p {
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Generated Result</h1>
        <p>${response.choices[0].message.content}</p>
      </div>
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
