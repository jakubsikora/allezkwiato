var express = require('express')
  , app = express()
  , port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/app'));

app.listen(port);
console.log('Server running on port', port);

// TODO:
// You must configure your server to use HistoryLocation

// Configuring your server

// When a visitor sends the url /assignments/123 or /settings to your app, they both must send your client application to the visitor.

// Here's an example using express:

// app.get('*', function (req, res) {
//   res.render('index');
// });
// This will route all requests to the index template rendered by your server and then React Router will take over from there.