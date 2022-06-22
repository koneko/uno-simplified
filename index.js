const express = require('express');
const app = express();
const { Server } = require("socket.io");
const port = process.env.PORT || 3000;

let rooms = []

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/assets/main.html")
})

app.get("/game", (req, res) => {
    res.sendFile(__dirname + "/assets/lobby.html")
})

app.get("/lobby/script.js", (req, res) => {
    res.sendFile(__dirname + "/assets/lobby.js")
})

let server = app.listen(port, () => console.log("Listening on port " + port));
const io = new Server(server)

io.on('connection', socket => {
    socket.on('join', data => {
        console.log(`${data.name}(${socket.id}) is attempting to join room ${data.id}`)
        //data = { id, name }
        const { id, name } = data;
        let room = rooms.find(room => room.id === id)
        if (!room) {
            let created = createRoom(id, name, socket.id)
            rooms.push(created)
            socket.emit('joinResponse', { host: true, success: true, names: null, order: 1, key: created.players[0].key })
            console.log(`${name}(${socket.id}) created room ${id}`)
            socket.join(id)
        } else {
            //check if playername exists already
            let player = room.players.find(player => player.name === name)
            if (player) return socket.emit('joinResponse', { host: false, success: false, names: null, order: null, key: null })
            if (room.players.length < 4) {
                console.log(`${name}(${socket.id}) successfuly joined room ${id}`)
                let key = generateKey(name, socket.id)
                room.players.push({ name: name, cards: [], host: false, order: room.players.length + 1, socket: socket.id, key: key })
                let pnames = room.players.map(p => p.name)
                socket.emit('joinResponse', { host: false, success: true, names: pnames, order: room.players.length, key: key })
                io.to(id).emit('playerJoin', { name: name, order: room.players.length })
                socket.join(id)
            } else {
                socket.emit('joinResponse', { host: false, success: false, names: null, order: null, key: null })
            }
        }
    })
    socket.on("kick", data => {
        console.log(`${socket.id} is attempting to kick ${data.name} from room ${data.id}`)
        const { id, name, key } = data;
        console.log(id, name, key)
        let room = rooms.find(room => room.id === id)
        if (!room) return
        let playerToKick = room.players.find(player => player.name === name)
        if (!playerToKick) return
        let host = room.players.find(player => player.host === true)
        if (!host) return
        if (host.key != key) return
        console.log(`${host.name}(${socket.id}) kicked ${playerToKick.name}(${playerToKick.socket}) from room ${id}`)
        io.to(id).emit('playerKick', { name: playerToKick.name })
        let socketToKick = io.sockets.sockets.get(playerToKick.socket)
        socketToKick.leave(id)
        room.players = room.players.filter(player => player.name !== name)
    })
    socket.on("message", data => {
        const { message, id, key } = data
        let room = rooms.find(room => room.id === id)
        if (!room) return
        let player = room.players.find(player => player.key === key)
        if (!player) return
        if (message.replace(/\s/g, "").length == 0) return
        io.to(id).emit('chatMessage', { name: player.name, message: message })
    })
    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`)
        let room = rooms.find(room => room.players.find(p => p.socket === socket.id))
        if (room) {
            console.log(`${socket.id} left room ${room.id}`)
            let p = room.players.find(p => p.socket === socket.id)
            if (p.host == true) {
                //delete room and tell players
                rooms = rooms.filter(room => room.id !== room.id)
                io.to(room.id).emit('roomDelete')
            } else {
                room.players.splice(room.players.indexOf(p), 1)
                io.to(room.id).emit('leaveRoom', { name: p.name })
                if (room.players.length == 0) {
                    console.log(`Room ${room.id} is empty, removing it.`)
                    rooms.splice(rooms.indexOf(room), 1)
                }
            }
        }
    })
})

function createRoom (id, name, socketid) {
    let cc = randomCard()
    while (cc == "black-4" || cc == "black-0" || cc.includes("reverse") || cc.includes("skip") || cc.includes("draw")) {
        cc = randomCard()
    }
    let room = {
        id: id,
        players: [{ name: name, cards: [], host: true, order: 1, socket: socketid, key: generateKey(name, id) }],
        nextCard: randomCard(),
        currentCard: cc,
        nextPlayer: 2,
        currentPlayer: 1,
        state: "waiting",
        winner: null
    }
    return room
}

function generateKey (name, id) {
    let timestamp = new Date().getTime();
    //split name after every character
    let nameSplit = name.split("")
    //split id after every 3 characters
    let idSplit = id.split("")
    let key = ""
    for (let i = 0; i < nameSplit.length; i++) {
        key += nameSplit[i].replace(/k/g, "53").replace(/n/g, "12")
        if (random(0, 9) == 3) key += random(5, 456).toString()
        if (i % 2 == 0) {
            key += "-"
        }
    }
    for (let i = 0; i < idSplit.length; i++) {
        key += idSplit[i]
        if (random(0, 1) == 1) key += random(35, 126).toString()
    }
    key += "-" + timestamp.toString().replace(/6/g, "XVI").replace(/9/g, "LX")
    return key.replace(/3/g, "1")
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