var express = require('express');
var http = require('http');
var request = require('request');
var redisClient = require('./redis').client;
var url = require('url');
var Chance = require('chance');
var chance = new Chance();

var app = express();
var server = http.createServer(app);

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));

// development only
if (app.get('env') == 'development') {
    app.use(express.errorHandler());
}

function generateCustomer() {
  return {
    name: chance.name(),
    phone: chance.phone(),
    email: chance.email()
  };
}

function createCustomers(current) {
  var x;
  if (!current) {
    current = [];
    for (x = 0; x < 100; x++) {
      current.push(generateCustomer());
    }
  } else {
    var changing = 2 + Math.floor(Math.random() * 5);
    for (x = 0; x < changing; x++) {
      current[Math.floor(Math.random() * current.length)] = generateCustomer();
    }
  }
  return current;
}

app.get('/customers', function(req, res) {
  redisClient.get('customers', function(err, result) {
    var customers = createCustomers(JSON.parse(result));
    res.end(JSON.stringify({
      customers: customers
    }));
    redisClient.set('customers', JSON.stringify(customers));
  });
});

app.post('/reset', function(req, res) {
  redisClient.del('customers');
  res.end();
});


server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

