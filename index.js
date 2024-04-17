const express = require('express')
const open = require('open')
const cors = require('cors')
const db = require('./db');
app = express()
db.connect()

var url = require('url');

const port = process.env.PORT || 3000

app.use(cors())

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
  open(`http://localhost:${port}`)
)
