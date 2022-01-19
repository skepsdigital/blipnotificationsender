const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 3000;

const notificationController = require('./controllers/notification.controller');

const router = express.Router();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/notification', notificationController);

app.listen(port, function () {
    console.log(`App listening on port 3000!`);
});