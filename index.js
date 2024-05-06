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

const auth = require('./auth');
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
app.use(auth);

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
