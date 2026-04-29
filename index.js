const express = require('express')
const open = require('open')
const db = require('./db');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const websockets = require('./websockets');
dotenv.config()
app = express()
db.connect()


const auth = require('./auth');
const battleship = require('./games/battleship');
const wordle = require('./games/wordle')
const dotsAndBoxes = require('./games/dotsAndBoxes');

const url = require('url');

const port = process.env.PORT || 3000

app.use(cookieParser());
app.use(bodyParser.json())
app.use(auth);

app.use(battleship);
app.use(wordle);
app.use(dotsAndBoxes);

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

const server = app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)

websockets.connect(server)
