/* 2001-05-25 (mca) : add-task.js */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

var http = require('http');

// set teh vars
var host, port, path, args, help;
host = 'localhost';
port = 3000;
path = 'http://' + host + ':' + port + '/collection/tasks/';
hdrs = {};
args = {};

help = '*** Usage:\n' +
  'node add-task.js "<description>" "<dueDate>" [<completed>]\n' +
  '  Where:\n' +
  '    <description> is text of task (in quotes)\n' +
  '    <dueDate> is YYYY-MM-DD (in quotes)\n' +
  '    <completed> is true|false';

// check args and fire off processing
if (process.argv.length < 4 || process.argv.length > 5) {
  console.log(help);
}
else {
  args.description = process.argv[2];
  args.dateDue = process.argv[3];
  args.completed = (process.argv[4] || false);

  getTemplate();
}

// get the server's write template
function getTemplate() {
  // request the template
  var options = { method: "GET" }
  var req = http.request(path, options, (response) => {
    var body = '';
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('error', function (error) {
      console.log(error);
    });
    response.on('end', function () {
      var data = JSON.parse(body);
      buildTask(data.collection.template);
    });
  });

  req.on('error', function (error) {
    console.log(error);
  });
  
  req.end();
}

// write the task data to the server
function buildTask(template) {
  var coll, i, x, msg;

  // populate the template
  coll = template.data;
  for (i = 0, x = coll.length; i < x; i++) {
    switch (coll[i].name) {
      case 'description':
        coll[i].value = args.description;
        break;
      case 'dateDue':
        coll[i].value = args.dateDue;
        break;
      case 'completed':
        coll[i].value = args.completed;
        break;
    }
  }
  msg = '{"template" : ' + JSON.stringify(template) + "}";
  sendData(msg);
}

// send the data to the server for storage
function sendData(msg) {
  var options = {
    method: "POST",
    headers: {
      'content-type': 'application/collection+json',
      'content-length': (msg.length)
    }
  }
  // pass data to the server
  var req = http.request(path, options, (response) => {
    var body = '';
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('error', function (error) {
      console.log(error);
    });
    response.on('end', function () {
      console.log('*** task added!');
    });
  });
  req.write(msg);

  req.on('error', function (error) {
    console.log(error);
  });

  req.end();
}

// eof