# Security Notes for FHIRsmith

## Introduction 

FHIRsmith is a public ready web server. All the modules are considered safe 
to deploy on the public web, but with some caveats that administrators need
to pay attention to.

## Supported Versions 

At this time, only the latest version is supported for security updates. 

## Reporting Security Issues 

Use the standard GitHub security reporting framework.

## Rate Limiting 

Some modules make extensive use of the file system and/or SQLite databases. 
The server does not itself have any rate limiting arrangements; instead, it 
is expected that the server will be deployed behind NGINX (or similar), and 
that NGINX will be configured to provide rate limiting as appropriate.

A typical NGINX configuration would be:

```
  limit_req zone=general burst=6000 delay=20;
  limit_req_status 429;
  limit_conn perip 50;
  limit_conn perserver 500;
```
## SSL

This server doesn't provide SSL support - use an NGINX reverse proxy for that.

