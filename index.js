const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const websockets = require('./websockets');
const battleship = require('./games/battleship');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(battleship);

app.use(express.static(__dirname + '/static'));

app.use((request, response) => {
  response.type('text/plain');
  response.status(404);
  response.send('404 - Not Found');
});

app.use((err, request, response, next) => {
  console.error(err.message);
  response.type('text/plain');
  response.status(500);
  response.send('500 - Server Error');
});

const server = app.listen(port, () => console.log(
  `Express started at "http://localhost:${port}"\n` +
  `press Ctrl-C to terminate.`
));

websockets.connect(server);
