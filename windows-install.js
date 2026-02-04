// npm install -g node-windows
// npm link node-windows

var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'FHIRServer-Node',
  description: 'FHIRsmith',
  script: "C:\\FHIRsmith\\server.js"
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();