// server.js
const jsonServer = require('json-server');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(cors());  // 👈 enable CORS
server.use(middlewares);
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // 👈 allow all origins by default
