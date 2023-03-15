export default class Client {

    constructor(id, name) {
        this.id = id
        this.name = name
        this.sentiment = "neutral"
    }

    toJson() {
        return {
            name: this.name,
            sentiment: this.sentiment
        }
    }
}