// npm install -g node-windows
// npm link node-windows

var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'FHIRServer-Node',
  description: 'Health Intersections Pty Ltd Node FHIRerver',
  script: "C:\\NodeServer\\server.js"
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();