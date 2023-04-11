//import { url } from "inspector";
const gameDiv = document.getElementById('game');
const gameInfoDiv = document.getElementById('game-info');
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

const COORD_RANGE = 11;
function getCoordinates(playerIndex, pos) {
    const parkFieldsCoordinates = [
        [
            [0, 0], [0, 1], [1, 1], [1, 0]
        ],
        [
            [0, 9], [0, 10], [1, 10], [1, 9]
        ],
        [
            [9, 9], [9, 10], [10, 10], [10, 9]
        ],
        [
            [9, 0], [10, 0], [10, 1], [9, 1]
        ],
    ];

    const finishFieldsCoordinates = [
        [
            [5, 1], [5, 2], [5, 3], [5, 4],
        ],
        [
            [1, 5], [2, 5], [3, 5], [4, 5],
        ],
        [
            [5, 9], [5, 8], [5, 7], [5, 6],
        ],
        [
            [9, 5], [8, 5], [7, 5], [6, 5],
        ],
    ];


    const openFieldsCoordinates = [
        [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
        [3, 4], [2, 4], [1, 4], [0, 4], [0, 5],

        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6],
        [4, 7], [4, 8], [4, 9], [4, 10], [5, 10],

        [6, 10], [6, 9], [6, 8], [6, 7], [6, 6],
        [7, 6], [8, 6], [9, 6], [10, 6], [10, 5],

        [10, 4], [9, 4], [8, 4], [7, 4], [6, 4],
        [6, 3], [6, 2], [6, 1], [6, 0], [5, 0]
    ];

    let coordinates;
    if (pos < 4) {
        coordinates = parkFieldsCoordinates[playerIndex][pos];
    } else if (pos > 43) {
        console.log(pos);
        let arrayIndex = pos - 44;
        coordinates = finishFieldsCoordinates[playerIndex][arrayIndex];
    } else {
        let fromPos = pos - 4;
        let absolutePos = (fromPos + 10 * playerIndex) % 40;
        coordinates = openFieldsCoordinates[absolutePos];
    }
    console.log(coordinates);
    return coordinates;

}

function getPlayerIndexByNum(players, num) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].num == num) {
            return i;
        }

    }
}

function getColorOfPlayerIndex(playerIndex) {
    let color;
    let colorText
    switch (playerIndex) {
        case 0:
            color = "yellow";

            colorText = "gelb";
            break;
        case 1:
            color = "green";
            colorText = "grün";
            break;
        case 2:
            color = "red";
            colorText = "rot";
            break;
        case 3:
            color = "blue";
            colorText = "blue";
            break;
        default:
            break;
    }
    return [color, colorText]
}

//connect     
let authenticationId = localStorage.getItem('authId');
let username = localStorage.getItem('username');


const socket = io({ auth: { token: authenticationId} });

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
let indexInRoom;
socket.on('newIndexInRoom', (newIndexInRoom) => {
    indexInRoom = newIndexInRoom;
    console.log(`newIndexInRoom: ${indexInRoom}` );
})

socket.on('update', (msgs) => {

    console.log('update');
    console.log(msgs[1])

    const roomId = msgs[0];
    const room = msgs[1];


    //url
    let currentUrl = (new URL(window.location.href));
    let origin = currentUrl.origin;
    console.log(`origin: '${origin}'`);

    if (infoUrl.getAttribute('value') != `${origin}/game/${roomId}` + roomId) {

        infoUrl.setAttribute('value', `${origin}/game/` + roomId);

        history.pushState(null, "", `${origin}/game/` + roomId);


    }

    //users
    for (let i = 0; i < 4; i++) {
        if (room.userData[i].name !== null) {
            playerNames[i].setAttribute('value', room.userData[i].name);
            playerReadiness[i].setAttribute('value', room.userData[i].status);
            if (indexInRoom == i) {
                playerNames[i].setAttribute("style", 'background: #37d037');
                playerIndex = i;
            }
            else {
                playerNames[i].setAttribute("style", '');
            }
            if (room.userData[i].status == true) {
                playerReadiness[i].innerHTML = "Ready";
            }
            else {
                playerReadiness[i].innerHTML = "Not Ready";
            }

        } else {
            playerNames[i].setAttribute('value', room.userData[i].name);
            playerReadiness[i].setAttribute('value', null);
        }

    }

    //game

    if (room.state) {
        const pawnConteiner = document.getElementById('pawn-container');
        let game = room.game;
        let clientIsPlayerInLine = false;

        //check if client is player in line
        for (let i = 0; i < room.userData.length; i++) {

            if (indexInRoom == i && game.playerInLine == room.userData[i].num) {
                clientIsPlayerInLine = true;
            }
        }




        //game-info
        const diceValue = document.getElementById("dice-value");
        diceValue.innerHTML = game.temp.dicevelue;
        let playerIndex = getPlayerIndexByNum(game.players, game.playerInLine);
        const [color, colorText] = getColorOfPlayerIndex(playerIndex);

        const colorElement = document.getElementById("player-in-line-color");
        colorElement.innerHTML = colorText;
        colorElement.style.color = color;



        //draw pawnpositions
        for (let playerIndex = 0; playerIndex < game.players.length; playerIndex++) {
            const player = game.players[playerIndex];
            let pawnsPlayerInLine = [];
            const [color, _] = getColorOfPlayerIndex(playerIndex);

            for (let pawnIndex = 0; pawnIndex < player.pawns.length; pawnIndex++) {
                const pawn = player.pawns[pawnIndex];

                const pawnElement = document.getElementById("pawn-" + playerIndex + "-" + pawnIndex);
                const [row, column] = getCoordinates(playerIndex, pawn.pos);
                pawnElement.style.gridRow = `${row + 1} / span 1`;
                pawnElement.style.gridColumn = `${column + 1} / span 1`;
                if (clientIsPlayerInLine && game.inputState == 3 && player.num == game.playerInLine) {
                    let moveablepawnIndex = game.temp.moveablepawns.indexOf(pawnIndex);
                    if (moveablepawnIndex != -1) {
                        pawnsPlayerInLine.push(pawnElement);
                        const pawnWhenMoved = document.createElement("div");
                        pawnWhenMoved.classList.add("pawnWhenMoved");
                        pawnWhenMoved.id = "pawnWhenMoved-" + pawnIndex;
                        pawnWhenMoved.classList.add(color);
                        pawnWhenMoved.classList.add("pawn_graphic");
                        const [row, column] = getCoordinates(playerIndex, game.temp.positionsWhenMoved[moveablepawnIndex]);
                        pawnWhenMoved.style.gridRow = `${row + 1} / span 1`;
                        pawnWhenMoved.style.gridColumn = `${column + 1} / span 1`;
                        pawnWhenMoved.style.display = "none";
                        pawnConteiner.appendChild(pawnWhenMoved);
                        pawnElement.addEventListener("mouseenter", (event) => { pawnWhenMoved.style.display = "block"; });
                        pawnElement.addEventListener("mouseleave", (event) => { pawnWhenMoved.style.display = "none"; });
                        pawnElement.addEventListener("click", (event) => {

                            let pawnsWhenMoved = document.getElementsByClassName("pawnWhenMoved");
                            pawnsWhenMoved = [...pawnsWhenMoved];
                            for (let i = 0; i < pawnsWhenMoved.length; i++) {
                                const pawn = pawnsWhenMoved[i];
                                console.log(`pown ${i} removed`);
                                pawn.parentNode.removeChild(pawn);
                            }

                            pawnsPlayerInLine.forEach(pawn => {
                                pawn.replaceWith(pawn.cloneNode(true));
                            });

                            //output
                            socket.emit("gameAction", { type: 3, value: moveablepawnIndex })
                            console.log(`output 3, value: ${moveablepawnIndex}`);
                        });
                    }
                }
            }
        }

        //dice
        if (clientIsPlayerInLine && (game.inputState == 2 || game.inputState == 1)) {
            const foreground = document.getElementById("foreground-container");
            foreground.style.display = "block";
            const roleDiceButton = document.getElementById("role-dice");
            roleDiceButton.style.display = "block";
            roleDiceButton.addEventListener("click", (event) => {
                roleDiceButton.replaceWith(roleDiceButton.cloneNode(true));
                foreground.style.display = "none";
                roleDiceButton.style.display = "none";
                socket.emit("gameAction", { type: game.inputState, value: 0 });
                console.log(`output ${game.inputState}`);
            });
        }
        //message
        if (clientIsPlayerInLine && game.inputState == 4) {
            const gameMessage = document.getElementById("game-message");
            gameMessage.innerHTML = game.temp.msg
            const foreground = document.getElementById("foreground-container");
            foreground.style.display = "block";
            const gameMessageConteiner = document.getElementById("game-message-conteiner");
            gameMessageConteiner.style.display = "block";
            const accaptGameMessageButton = document.getElementById("accapt-game-message");
            accaptGameMessageButton.addEventListener("click", (event) => {
                accaptGameMessageButton.replaceWith(accaptGameMessageButton.cloneNode(true));

                foreground.style.display = "none";
                gameMessageConteiner.style.display = "none";

                socket.emit("gameAction", { type: game.inputState, value: 0 });
                console.log(`output ${game.inputState}`);
            });
        }
        //end
        if (game.inputState == 5 && game.winner > -1) {
            const winnerNum = getPlayerIndexByNum(game.players, game.winner);
            const [color, colorText] = getColorOfPlayerIndex(playerIndex);

            const gameMessage = document.getElementById("game-message");
            gameMessage.innerHTML = `Spieler <span style="color: ${color};"> ${colorText} </span> hat gewonnen!`;
            const foreground = document.getElementById("foreground-container");
            foreground.style.display = "block";
            const gameMessageConteiner = document.getElementById("game-message-conteiner");
            gameMessageConteiner.style.display = "block";
            const accaptGameMessageButton = document.getElementById("accapt-game-message");
            accaptGameMessageButton.addEventListener("click", (event) => {
                accaptGameMessageButton.replaceWith(accaptGameMessageButton.cloneNode(true));

                foreground.style.display = "none";
                gameMessageConteiner.style.display = "none";

                //socket.emit("gameAction", { type: game.inputState, value: 0 });
                console.log(`output ${game.inputState}`);
            });
        }
        gameInfoDiv.style.display = "block";
    } else {
        gameInfoDiv.style.display = "none";
    }
    console.log(msgs);
    
    console.log(socket);
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