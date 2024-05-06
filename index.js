const express = require('express')
const open = require('open')
const cors = require('cors')
const db = require('./db');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app = express()
db.connect()
dotenv.config()


const battleship = require('./games/battleship');
const wordle = require('./games/wordle')

var url = require('url');

const port = process.env.PORT || 3000

var whitelist = ['http://localhost:3000', 'https://lively-dune-0fea8d010.4.azurestaticapps.net']
var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))
app.use(cookieParser());
app.use(bodyParser.json())


app.use(battleship);
app.use(wordle);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))


app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;

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

  // Get user details
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });

  // Get username from response
  const { login } = await userResponse.json();

  if (accessToken) {
    // Create session cookie
    res.cookie('accessToken', accessToken, {
      sameSite: 'None',
      secure: true
    })

    // Return access token and user details
    res.json({ success: true, accessToken, user: login });
  } else {
    res.status(204).send()
  }
});

app.get('/auth/check', (req, res) => {
  if (!req.cookies) {
    res.status(204).send()
    return;
  }
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    res.status(204).send()
    return;
  }
  // Verify access token against github
  fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  }).then((response) => response.json())
    .then((data) => {
      res.json({ success: true, accessToken, user: data.login });
    })
    .catch(() => {
      res.status(204).send()
    });
});

app.get('/auth/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.status(204).send()
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
  //open(`http://localhost:${port}`)
)
