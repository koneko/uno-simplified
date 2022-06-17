const express = require('express');
const app = express();
const { Server } = require("socket.io");
const port = process.env.PORT || 3000;

let rooms = []

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/assets/main.html")
})

app.get("/lobby", (req, res) => {
    res.sendFile(__dirname + "/assets/lobby.html")
})

app.get("/lobby/script.js", (req, res) => {
    res.sendFile(__dirname + "/assets/lobby.js")
})

let server = app.listen(port, () => console.log("Listening on port " + port));
const io = new Server(server)

io.on('connection', socket => {
    socket.on('join', data => {
        //data = { id, name }
        const { id, name } = data;
        let room = rooms.find(room => room.id === id)
        if (!room) {

        }
    })
})

function createRoom (id, name) {
    let cc = randomCard()
    while (nc == "black-4" || nc == "black-0" || nc.contains("reverse") || nc.contains("skip") || nc.contains("draw")) {
        nc = randomCard()
    }
    let room = {
        id: id,
        players: [{ name: name, cards: [], host: true, order: 0 }],
        nextCard: randomCard(),
        currentCard: cc,
        nextPlayer: 2,
        currentPlayer: 0,
    }
    return room
}

function randomCard () {
    let result = ""
    let color = random(1, 4)
    let value = random(1, 15)
    if (value == 14) return "black-4" // draw +4 and pick a color
    else if (value == 15) return "black-0" // draw none and pick a color
    switch (color) {
        case 1:
            result += "r-";
            break;
        case 2:
            result += "g-"
            break;
        case 3:
            result += "b-";
            break;
        case 4:
            result += "y-";
            break;
    }
    switch (value) {
        case 1:
            result += "0";
            break;
        case 2:
            result += "1";
            break;
        case 3:
            result += "2";
            break;
        case 4:
            result += "3";
        case 5:
            result += "4";
            break;
        case 6:
            result += "5";
            break;
        case 7:
            result += "6";
            break;
        case 8:
            result += "7";
            break;
        case 9:
            result += "8";
            break;
        case 10:
            result += "9";
            break;
        case 11:
            result += "reverse";
            break;
        case 12:
            result += "skip";
            break;
        case 13:
            result += "draw"
            break;
    }
    return result;
}

function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}