var express = require('express');
var jwt = require('jsonwebtoken');
var bitbutter = require('bitbutter').default;

require('dotenv').config();

var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/tokens', function (req, res) {
  var secret = process.env.SERVER_SECRET;
  var options = { expiresIn: 60 * 5 }; // expires in 5 minutes
  var token = jwt.sign({}, secret, options);
  res.status(200).json({ token });
});

app.post('/users', function (req, res) {
  var token = req.header('Authorization') || '';
  token = token.replace('Bearer ', '');

  jwt.verify(token, process.env.SERVER_SECRET, function(err, decoded) {
    if (err) {
      res.status(403).json({ message: 'Invalid token' });
    } else {
      var partnerClient = new bitbutter({
        apiKey: process.env.PARTNER_ACCESS_KEY,
        endpoint: process.env.ENDPOINT,
        partnerId: process.env.PARTNER_ID,
        partnershipId: process.env.PARTNERSHIP_ID,
        secret: process.env.PARTNER_SECRET,
      });

      partnerClient.createUser().then(function (newUser) {
        res.status(200).json(newUser);
      });
    }
  });
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port: ' + port);
});

