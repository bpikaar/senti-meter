export default class Socket {
    constructor() {
        // this.host = "http://145.24.222.135:8000"
        this.host = "localhost:8000"

        this.addPlayerElement = document.querySelector("#add-player")
        this.playerInfo = document.querySelector("#player-info")
        this.addPlayerElement.querySelector("button").addEventListener("click", () => this.addPlayer())
        // Socket setup
        console.log("Trying to connect to socket server")
        this.socket = io(this.host, {
            // transports: ['websocket']
        })

        // client-side
        this.socket.on("connect", () => {
            console.log("Connected with id: " + this.socket.id)
        })

        this.socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`)
        })

        this.socket.on("update", (happiness) => {
            document.querySelector("#players-sentiment").innerHTML = happiness
        })
    }

    addPlayer() {
        if (document.querySelector("#player-name").value === "") {
            addPlayerElement.querySelector("error").style.display = "block"
            return
        }
        const playerName = document.querySelector("#player-name").value
        console.log("Adding player " + playerName)
        this.socket.emit("new player", { id: this.socket.id, name: playerName }, (response) => {
            console.log(response.message)
        })
        this.addPlayerElement.style.display = "none"

        // show player info
        this.playerInfo.querySelector("h2").innerHTML = `Hi ${playerName}`
        this.playerInfo.style.display = "block"
    }

    sendSentiment(sentiment) {
        this.socket.emit("sentiment", this.socket.id, sentiment, (response) => {
            console.log(response.message)
        })
    }

    pictureFound() {
        // send "found picture" event to server and receive response in callback
        this.socket.emit("found picture", { name: "updated" }, (response) => {
            console.log(response.status) // ok
        })
    }
}









