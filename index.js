const express = require('express')
const open = require('open')
const cors = require('cors')
const db = require('./db');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
app = express()
db.connect()
dotenv.config()


const battleship = require('./games/battleship');

var url = require('url');

const port = process.env.PORT || 3000

app.use(cors())
app.use(battleship);
app.use(bodyParser.json())

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))


app.post('/auth/github/callback', async (req, res) => {
  const { code } = req.body;

  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (accessToken) {
    // Use this access token to fetch user details or other tasks.
    // Maybe generate a JWT and send it to the frontend for session management.
    res.json({ success: true, accessToken });
  } else {
    res.json({ success: false });
  }
});

// The app.get functions below are being processed in Node.js running on the server.
// Implement a custom About page.
app.get('/', (request, response) => {
  response.type('text/plain')
  response.send('Home page')
})

// Custom 404 page.
app.use((request, response) => {
  response.type('text/plain')
  response.status(404)
  response.send('404 - Not Found')
})

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})

app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`),
  open(`http://localhost:${port}`)
)
