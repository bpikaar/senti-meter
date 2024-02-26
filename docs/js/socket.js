export default class Socket {
    constructor() {
        // this.host = "https://sandbox.cmgt.hr.nl:8000"
        this.host = "localhost:8000";

        // custom Event for updating clients in de frontend
        this.updateClientsEvent = new Event("updateClients");

        // Socket setup
        console.log("Trying to connect to socket server");
        this.socket = io(this.host, {
            // transports: ['websocket']
        });

        // client-side
        this.socket.on("connect", () => {
            console.log("Connected with id: " + this.socket.id);
        });

        this.socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });

        this.socket.on("update", (happiness, numberOfClients) =>
            this.updateStatus(happiness, numberOfClients));

        // disconnect from server
        this.socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });
    }

    /**
     * Add client to the server
     * @param {string} clientName 
     * @returns {Promise<string>} message
     */
    async addClient(clientName) {
        await this.socket.emit("new client", clientName, (error, response) => {
            if (error) {
                return error;
            } else {
                console.log(response.message);
                return response.message;
            }
        });
    }

    updateStatus(happiness, clients) {
        // console.log(happiness, numberOfClients)
        document.querySelector("#clients-sentiment").innerHTML = happiness;
        document.querySelector("#amount").innerHTML = clients.length;
        this.updateClientsEvent.clients = clients;
        document.dispatchEvent(this.updateClientsEvent);
    }

    /**
     * Send the sentiment to the server
     */
    sendSentiment(sentiment) {
        this.socket.emit("sentiment", sentiment);
    }

    /**
     * disconnect the client from the server
     */
    disconnect() {
        this.socket.disconnect();
        window.location.reload();
    }
}