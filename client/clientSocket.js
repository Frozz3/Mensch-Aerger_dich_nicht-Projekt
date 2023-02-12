//import { url } from "inspector";

const infoUrl = document.getElementById('roomLink');
const playerNames = document.getElementsByClassName('playerName')
const playerReadiness = document.getElementsByClassName('button_player')
const msgForm = document.getElementById('form1');
const msgInput = document.getElementById('input1');
const roomForm = document.getElementById('form2');
const roomInput = document.getElementById('input2');
const sendMessage = document.getElementById('sendMessage');
const enterRoom = document.getElementById('enterRoom');
const createRoom = document.getElementById('createRoom');

//connect     
let authenticationId = localStorage.getItem('authId');

const socket = io({ auth: { token: authenticationId } });

socket.on("connect", () => {
    console.log(`socketId: ${socket.id}`);
});

socket.on("connect_error", (err) => {
    console.log("connection error");
    console.table(err);
    alert(`connect_error message: ${err.message}`);
});

//authentication


socket.on('newAuthenticationId', function (authenticationId) {
    console.log("newAuthenticationId saved: " + authenticationId);
    localStorage.setItem('authId', authenticationId);
});

/*
//messages
sendMessage.addEventListener('click', function (e) {
    e.preventDefault();
    if (msgInput.value) {
        socket.emit('chatMessage', msgInput.value);
        msgInput.value = '';
    }
});

socket.on('chatMessage', function (msg) {
    let item = document.createElement('li');
    item.textContent = msg;
    messages.insertAdjacentElement('afterbegin', item);
});

//Rooms
enterRoom.addEventListener('click', function (e) {
    const roomInputValue = roomInput.value;
    e.preventDefault();
    if (roomInputValue) {
        socket.emit('joinRoom', roomInputValue);
        roomInput.value = '';
    }
});

createRoom.addEventListener('click', function (e) {
    e.preventDefault();
    socket.emit('createRoom', null);
});
*/
//update
socket.on('update', (msgs) => {

    console.log('update');

    if (infoUrl.getAttribute('value') != `http://localhost:3000/game/` + msgs[0]) {

        infoUrl.setAttribute('value', `http://localhost:3000/game/` + msgs[0]);
        history.replaceState({}, null, `http://localhost:3000/game/${msgs[0]}`);
    }

    const filledUserSlots =  msgs[1].users.length
    for (let index = 0; index < 4; index++) {
        if ((filledUserSlots) > index) {
            playerNames[index].setAttribute('value', msgs[1].users[index]);
            if (socket.id == msgs[1].users[index])
            {playerNames[index].setAttribute("style", 'background: #37d037');}
            else
            {playerNames[index].setAttribute("style", '');}
        }else{
            playerNames[index].setAttribute('value', '');
            playerNames[index].setAttribute("style", '');
        }
    }
    console.table(msgs);
});

//error
socket.on('error', (msg,data) => {
    console.log(`error message: ${msg}`);
    console.log(data);
    alert(`error message: ${msg}`);
});

// reenter room

//pathNames[1].slice(0,5);
let roomIdRegex = "/game\/([0-9a-f]{5})";
const roomId = window.location.pathname.match(roomIdRegex);
console.log(`rommId from url: '${roomId}'`);

if (roomId) {
    socket.emit('joinRoom', roomId[1]);

    console.log('try joining Room:', roomId[1]);
} else {
    socket.emit('createRoom');
    console.log('try createRoom');
}