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
let username = localStorage.getItem('username');


const socket = io({ auth: { token: authenticationId, name: username } });

socket.on("connect", () => {
    console.log(`socketId: ${socket.id}`);
});

socket.on("connect_error", (err) => {
    console.log("connection error");
    console.table(err);
    alert(`connect_error message: ${err.message}`);
});

//user

socket.on('newAuthenticationId', function (newAuthenticationId) {
    authenticationId = newAuthenticationId;
    localStorage.setItem('authId', newAuthenticationId);
    console.log("new AuthenticationId saved: " + newAuthenticationId);
});

socket.on('newUsername', function (newUsername) {
    newUsername = newUsername;
    console.log("new Username received: " + newUsername);
});


//room

socket.on('update', (msgs) => {

    console.log('update');

    if (infoUrl.getAttribute('value') != `http://localhost:3000/game/` + msgs[0]) {

        infoUrl.setAttribute('value', `http://localhost:3000/game/` + msgs[0]);
        history.replaceState({}, null, `http://localhost:3000/game/${msgs[0]}`);
    }

    const filledUserSlots =  msgs[1].userAuthIds.length
    for (let index = 0; index < 4; index++) {
        if ((filledUserSlots) > index) {
            playerNames[index].setAttribute('value', msgs[1].userData[index].name);
            if (authenticationId == msgs[1].userAuthIds[index])
            {playerNames[index].setAttribute("style", 'background: #37d037');}
            else
            {playerNames[index].setAttribute("style", '');}
        }else{
            playerNames[index].setAttribute('value', '');
            playerNames[index].setAttribute("style", '');
            toggleText(playerReadiness[index],false)
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