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
let playerIndex = 0;
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

    let currentUrl = (new URL(window.location.href));
    let hostname = currentUrl.hostname;
    console.log(`hostname: '${hostname}'`);

    if (infoUrl.getAttribute('value') != `http://${hostname}:3000/game/${msgs[0]}` + msgs[0]) {

        infoUrl.setAttribute('value', `http://${hostname}:3000/game/` + msgs[0]);

        history.pushState(null, "", `http://${hostname}:3000/game/` + msgs[0]);


    }

    for (let index = 0; index < 4; index++) {
        if (msgs[1].userAuthIds[index] !== null) {
            playerNames[index].setAttribute('value', msgs[1].userData[index].name);
            playerReadiness[index].setAttribute('value', msgs[1].userData[index].status);
            if (authenticationId == msgs[1].userAuthIds[index]) {
                playerNames[index].setAttribute("style", 'background: #37d037');
                playerIndex = index;
            }
            else {
                playerNames[index].setAttribute("style", '');
            }
            if (msgs[1].userData[index].status == true) {
                playerReadiness[index].innerHTML = "Ready";
            }
            else {
                playerReadiness[index].innerHTML = "Not Ready";
            }

        } else {
            playerNames[index].setAttribute('value', msgs[1].userData[index].name);
            playerReadiness[index].setAttribute('value', null);
        }

    }
    console.table(msgs);
});

//error
socket.on('error', (msg, data) => {
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