console.log("Starting socket server")
// import http and socket.io
import { createServer } from "https"
import { Server } from "socket.io"
import { readFileSync } from "fs"
import Player from "./player.js"

const host = "sandbox.cmgt.hr.nl"
// const host = "localhost"
const serverPort = 8000
const clientHost = "http://localhost"
let percentageHappy = 0

let players = []
// const player = new Player("test")
// console.log(player.name)

console.log("Creating server")
const httpsServer = createServer({
    key: readFileSync("/etc/ssl/private/sandbox_cmgt_hr_nl.key"),
    cert: readFileSync("/etc/ssl/certs/sandbox_cmgt_hr_nl.cer")
}, (req, res) => {
    console.log("Server created")
    res.writeHead(200)
    res.end("My first server!")
})

console.log("Creating socket server")
const io = new Server(httpsServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    // ...
    console.log("Socket connected with id:")
    console.log(socket.id)

    //TODO do not use socket.id https://socket.io/docs/v4/troubleshooting-connection-issues/#usage-of-the-socketid-attribute
    // receive "new player" event and add player to players array
    socket.on("new player", (player, callback) => {
        players.push(new Player(
            player.id,
            player.name))
        callback({
            message: `Player ${player.name} added.`
        })
        console.log(players)
        startUpdatePlayers(socket)
    })

    // receive "new sentiment" event and add player to players array
    socket.on("sentiment", (id, sentiment, callback) => {
        // get player based on id and update sentiment
        if (players.map(player => player.id).indexOf(id) !== -1) {
            players[players.map(player => player.id).indexOf(id)].sentiment = sentiment
        }
        // callback({
        //     message: `Player found.`
        // })
        console.log(players)
    })

    // receive "found picture" event from client and send response in callback
    socket.on("found picture", (arg1, callback) => {
        console.log(arg1) // { name: "updated" }
        callback({
            status: "ok"
        })
    })

})

console.log("Listening on port " + serverPort + "")
httpsServer.listen(serverPort, host, () => {
    console.log("Server listening on port " + serverPort + "")
})

function startUpdatePlayers(socket) {
    // send "update" event to client every 500ms
    if (players.length > 0) {
        setInterval(() => {
            let people = players.length == 1 ? "1 person" : players.length + " people"
            socket.emit("update", `${(percentageHappy * 100).toFixed(0)} % is happy (${people} joined)`)
            updatePlayers()
        }, 500)
    }
}

function updatePlayers() {
    // calculate percentage of happy players
    percentageHappy = players.filter(player =>
        player.sentiment === "happy").length / players.length
    console.log(players.filter(player => player.sentiment === "happy").length)
    console.log(percentageHappy * 100 + "% happy")
}