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
    alert("Please refresh page, host left the room.")
    window.location.reload()
})

socket.on("turnChange", data => {
    let { name, order } = data; // handle
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
