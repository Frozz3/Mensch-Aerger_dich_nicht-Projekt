//import { url } from "inspector";

const infoUrl = document.getElementById('roomLink');
const playerNames = document.getElementsByClassName('playerName')

//connect     
let authenticationId = localStorage.getItem('authId');

const socket = io({ auth: { token: authenticationId } });

socket.on("connect", () => {
    console.log(`socketId: ${socket.id}`);
});

socket.on("connect_error", (err) => {
    console.log("connection error");
    console.table(err);
});

//authentication
socket.on('newAuthenticationId', function (authenticationId) {
    console.log("newAuthenticationId saved: " + authenticationId);
    localStorage.setItem('authId', authenticationId);
});

//update
socket.on('update', (msgs) => {

    console.log('update');

    if (infoUrl.getAttribute('value') != `http://localhost:3000/game/` + msgs[0]) {

        infoUrl.setAttribute('value', `http://localhost:3000/game/` + msgs[0]);
        history.replaceState({}, null, `http://localhost:3000/game/${msgs[0]}`);
    }

    for (let index = 0; index < 4; index++) {
        if ((msgs[1].users.length) > index) {
            playerNames[index].setAttribute('value', msgs[1].users[index]);
            if (socket.id == msgs[1].users[index])
            {
                index
                playerNames[index].setAttribute("style", 'background: #37d037');
        }
            else
            {playerNames[index].setAttribute("style", '');}
        }else{
            playerNames[index].setAttribute('value', '');
            playerNames[index].setAttribute("style", '');
        }
       


    }
    console.table(msgs);
});

//error message
socket.on('error', (msg) => {
    console.log(`error message: ${msg}`);
});

// reenter room
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