console.log("Starting socket server");
const args = process.argv[2] === "-d" ? true : false;
const DEBUG = args;
console.log("Debug is " + DEBUG);
// import http and socket.io
import { createServer } from "http";
import { createServer as createSecureServer } from "https";
import { Server } from "socket.io";
import { readFileSync } from "fs";
import Client from "./client.js";
import { log } from "console";

const host = DEBUG ? "localhost" : "programmeren9.cmgt.hr.nl";
const serverPort = 8100;
let server = null;
let percentageHappy = 0;

let clients = [];

if (process.argv.length === 2) {
    console.error('Expected at least one argument!');
    process.exit(1);
}

if (DEBUG) {
    console.log("Creating server");
    server = createServer({}, (req, res) => {
        console.log("Server created");
        res.writeHead(200);
        res.end("My first server!");
    });
} else {
    console.log("Creating secure server");
    server = createSecureServer({
	key: readFileSync("/etc/ssl/private/key-programmeren9.cmgt.hr.nl.pem"),
        cert: readFileSync("/etc/ssl/certs/programmeren9.cmgt.hr.nl.cert")
        //key: readFileSync("/etc/ssl/private/sandbox_cmgt_hr_nl.key"),
        //cert: readFileSync("/etc/ssl/certs/sandbox_cmgt_hr_nl.cer")
    }, (req, res) => {
        console.log("Secure Server created");
        res.writeHead(200);
        res.end("My first server!");
    });
}

console.log("Creating socket server");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    // ...
    console.log("Socket connected with id:");
    console.log(socket.id);

    //TODO do not use socket.id https://socket.io/docs/v4/troubleshooting-connection-issues/#usage-of-the-socketid-attribute
    // receive "new client" event and add client to clients array
    socket.on("new client", (clientName, callback) => {
        clients.push(new Client(socket.id, clientName));

        callback({
            message: `Client ${clientName} added.`
        });
        console.log(clients);
        startUpdateClients(socket);
    });

    // receive "new sentiment" event and update sentiment of client in clients array
    socket.on("sentiment", (sentiment) => {
        // get client based on socket and update sentiment
        if (clients.length > 0) {
            let client = clients[clients.map(client => client.id).indexOf(socket.id)];
            if (client) {
                client.sentiment = sentiment;
            }
        }
    });
    // on disconnect, remove client from clients array
    socket.on("disconnect", () => disconnectClient(socket));

});

console.log("Listening on port " + serverPort + "");
server.listen(serverPort, host, () => {
    console.log("Server listening on port " + serverPort + "");
});

function startUpdateClients(socket) {
    // send "update" event to client every 500ms
    if (clients.length > 0) {
        setInterval(() => {
            socket.emit("update", `${(percentageHappy * 100).toFixed(0)}%`, clients.map(client => client.toJson()));
            console.log(clients.length + " clients connected");
            updateClients();
        }, 500);
    }
}

function updateClients() {
    if (clients.length !== 0) {
        // calculate percentage of happy clients
        percentageHappy = clients.filter(client =>
            client.sentiment === "happy").length / clients.length;
        console.log(clients.filter(client => client.sentiment === "happy").length);
    } else { percentageHappy = 0; }

    console.log(percentageHappy * 100 + "% happy");
}

/**
 * disconnect the client from the server based on socket
 */
function disconnectClient(socket) {
    // remove client from clients array
    clients = clients.filter(client => client.id !== socket.id);
    console.log("Client disconnected");
    console.log(clients);
}
