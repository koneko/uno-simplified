const socket = io()
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

socket.emit('join', { id, name: localStorage.us_username })

socket.on("joinResponse", data => {

})