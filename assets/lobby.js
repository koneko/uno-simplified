const socket = io()
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
let you = { host: null, order: null, cards: [], key: null, id: null }
let alternate = "white"
let players = []

if (!id || id === null || localStorage.us_username == null) window.location.href = "/"
else socket.emit('join', { id, name: localStorage.us_username })

socket.on("joinResponse", data => {
    let { host, success, names, order, key } = data;
    if (!success) return window.location.href = "/"
    you.host = host;
    you.order = order;
    you.key = key;
    you.id = id;
    let pre = document.querySelector(".pre-container")
    let plist = document.querySelector(".playerlist")
    let currentord = 1
    let first = null
    players.push({ name: localStorage.us_username, cards: [], cardCount: 0, order: order, you: true })
    if (names) {
        names.forEach(name => {
            let div = document.createElement("div")
            div.classList.add("player")
            div.innerHTML = `
                <div class="left-player">${name}</div>
                <div class="right-player" id="${name}-player"></div>
            `
            plist.appendChild(div)
            if (!host) {
                let div = document.getElementById(`${name}-player`)
                div.innerHTML = `Order: ${currentord}`
                div.style.textAlign = "center"
                currentord++
            }
        })
        first = false

    }
    if (host) {
        if (first == null) first = true
        let button = document.createElement("button")
        button.classList.add("start-button")
        button.innerHTML = "Start Game"
        button.addEventListener("click", () => {
            startGame()
        })
        pre.appendChild(button)
        let div = document.createElement("div")
        div.classList.add("player")
        div.innerHTML = `
            <div class="left-player">${localStorage.us_username}</div>
            <div class="right-player" id="${localStorage.us_username}-player"></div>
        `
        plist.appendChild(div)
    }
})

socket.on("playerJoin", data => {
    let { name, order } = data;
    let plist = document.querySelector(".playerlist")
    let div = document.createElement("div")
    div.classList.add("player")
    div.innerHTML = `
        <div class="left-player">${name}</div>
        <div class="right-player" id="${name}-player"></div>
    `
    plist.appendChild(div)
    let playerdiv = document.getElementById(name + "-player")
    let button = document.createElement("button")
    button.classList.add("kick-button")
    button.innerHTML = "Kick"
    button.addEventListener("click", () => {
        if (you.host) {
            socket.emit("kick", { name, key: you.key, id: you.id })
        }
    })
    if (you.host) playerdiv.appendChild(button)
    players.push(formatPlayer(name, order))
})

socket.on("playerKick", data => {
    console.log("Recieved kick")
    let name = data.name
    if (name == localStorage.us_username) {
        alert("You got kicked, skill issue.")
        return window.location.href = "/"
    }
    let playerdiv = document.getElementById(name + "-player")
    let parent = playerdiv.parentElement
    parent.remove()
    removePlayer(name)
})

socket.on("leaveRoom", data => {
    let name = data.name;
    let playerdiv = document.getElementById(name + "-player")
    let parent = playerdiv.parentElement
    parent.remove()
    removePlayer(name)
})

socket.on("chatMessage", data => {
    let { message, name } = data;
    let chat = document.querySelector(".chat")
    let div = document.createElement("div")
    div.classList.add("chat-message")
    let user = document.createElement("span")
    user.classList.add("chat-user")
    user.textContent = name + ": "
    if (name == localStorage.us_username) user.style.color = "dodgerblue"
    let value = document.createElement("span")
    value.classList.add("chat-value")
    value.textContent = message
    div.style.backgroundColor = alternate
    div.appendChild(user)
    div.appendChild(value)
    chat.appendChild(div)
    chat.scrollTop = chat.scrollHeight
    if (alternate == "white") alternate = "lightgray"
    else alternate = "white"
})

socket.on("roomDelete", () => {
    alert("Please refresh page, host lost connection.")
    window.location.reload()
})

function startGame () {
    socket.emit("startGame", { key: you.key, id: you.id })
}

function sendMessage () {
    let input = document.getElementById("message-input")
    let message = input.value
    socket.emit("message", { message, key: you.key, id: you.id })
    input.value = ""
}

function formatPlayer (name, order) {
    return {
        name: name,
        cards: [],
        cardCount: 0,
        order: order,
        you: false
    }
}

function removePlayer (name) {
    players.splice(players.findIndex(player => player.name == name), 1)
}

document.getElementById("message-input").addEventListener("keydown", e => {
    if (e.keyCode == 13) {
        sendMessage()
    }
})


// logic:
// start(gameStart)
// => hand out cards(recieveCards), host goes first
// => first player plays or draws(playCard or drawCard)
// => change turn (turnChange)
// => next player plays (playCard or drawCard)
// => repeat, handling color changes and "event cards" (repeat before)
// => when a person has no cards left, they are declared winner and game ends, kicking everyone out and closing room (gameEnd)


// game logic

socket.on("gameStart", data => {
    // handle starting the game
    let pre = document.querySelectorAll(".pre-container")
    let gamecontainer = document.querySelector(".game-container")
    pre.style.display = "none"
    gamecontainer.style.display = "block"
    let { order } = data;
})

socket.on("turnChange", data => {
    let { name, order } = data; // handle ui on turn change here
})

socket.on("drawCard", data => {
    let { name, card, order } = data; // handle ui on draw card here
})

socket.on("playCard", data => {
    let { name, card, order } = data; // handle ui on play card here
})

socket.on("changeColor", data => {
    let { name, color, order } = data; // handle ui on change color here
})

socket.on("reverseOrder", data => {
    let { name, orderArray } = data; // handle ui on reverse order here
})

socket.on("skipTurn", data => {
    let { name, playerOrder, skippedName, skippedOrder } = data; // handle ui on skip turn here
})

socket.on("forceDraw", data => {
    let { name, playerOrder, forcedName, forcedOrder } = data; // handle ui on force draw here
})

socket.on("recieveCards", data => {
    let { key, cards } = data // get your cards, update ui
})

socket.on("gameEnd", data => {
    // handle game end
})