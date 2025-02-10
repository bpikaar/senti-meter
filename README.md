# Senti-Meter

![Screenshot of the app](screenshot-app.png)

**A app that shows the sentiment of a group of people.**

This app contains a Socket.io server and a client that connects to it.

A client needs to enter a name after which the client connects to the server and the webcam starts.

The Ml5Js FaceApi detects the face and messures the sentiment based on the corners of the mouth. When the sentiment changes, the client send the sentiment to the server. The server responds with the percentage of hapiness based on the average of all the clients.

# Installation

## Client

Change the host in `./docs/js/socket.js` to the IP address of the server.

## Server

Install the dependencies and start the Socket.io server.

```bash
cd server
npm i
npm run dev # for development
npm run start # for production
```

# Live

## server

development: `npm run dev`

production: `npm run start`

## client

*Server for client-side*

### Node server

https://www.npmjs.com/package/http-server

**Globally via npm**
```bash
  npm install --global http-server 
```
run 
```bash
  http-server
```
Https server

```bash
sudo http-server -S -C /etc/ssl/certs/sandbox.cmgt.hr.nl.cert -K /etc/ssl/private/sandbox.cmgt.hr.key -p 443

```

-p 443 voor https port 

-C voor cert

-K voor private key

met sudo uitvoeren voor toegang tot private key

### Python server
```python
from http.server import HTTPServer, SimpleHTTPRequestHandler
from ssl import PROTOCOL_TLS_SERVER, SSLContext

ssl_context = SSLContext(PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain("/etc/ssl/certs/my.cert", "/etc/ssl/private/my.key")
server = HTTPServer(("0.0.0.0", 8888), SimpleHTTPRequestHandler)
server.socket = ssl_context.wrap_socket(server.socket, server_side=True)
server.serve_forever()
```

```bash
$ python3 secure-server.py
```

https://programmeren9.cmgt.hr.nl:8888/
