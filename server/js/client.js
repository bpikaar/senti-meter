export default class Client {

    emoji = [
        "😦",  // 0 sad
        "😐",  // 1 neutral
        "😯",  // 2 surprised
        "🙂",  // 3 smile
        "😀",  // 4 big smile
        "😆",  // 5 big smile with teeth
        "😉"   // 6 wink
    ];
    constructor(id, name) {
        this.id = id
        this.name = name
        this.sentiment = "😐"
    }

    toJson() {
        return {
            name: this.name,
            sentiment: this.sentiment
        }
    }

    getSentimentNumber() {
        return this.emoji.indexOf(this.sentiment);
    }
}