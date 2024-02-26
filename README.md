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

# Demo

https://sandbox.cmgt.hr.nl/
