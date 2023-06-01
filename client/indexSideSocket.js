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
        let arrayIndex = pos - 44;
        coordinates = finishFieldsCoordinates[playerIndex][arrayIndex];
    } else {
        let fromPos = pos - 4;
        let absolutePos = (fromPos + 10 * playerIndex) % 40;
        coordinates = openFieldsCoordinates[absolutePos];
    }
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

let messageCounter;
function createMessage(foreground, message, zIndex, buttomText, onclickFn) {

    messageCounter++
    console.log("messageCounter: " + messageCounter);
    foreground.style.display = "block";

    // create conteiner
    const messageConteiner = document.createElement("div");
    messageConteiner.classList.add("game-message-conteiner");
    messageConteiner.id = "game-message-" + messageCounter


    // create elements
    const messageButton = document.createElement("button");
    const messageText = document.createElement("p");

    messageButton.classList.add("game-message-button");
    messageText.classList.add("game-message-text");

    messageButton.innerHTML = buttomText;
    messageText.innerHTML = message;

    foreground.appendChild(messageConteiner);
    messageConteiner.appendChild(messageText);
    messageConteiner.appendChild(messageButton);

    // add onclick listener
    messageButton.addEventListener("click", (event) => {

        messageConteiner.remove();
        onclickFn();
        messageCounter--
        console.log("messageCounter: " + messageCounter);
        if (messageCounter == 0) {

            foreground.style.display = "none";
        }
    });
    return messageConteiner;

    //setTimeout(() => {foreground.appendChild(messageConteiner);}, 8000);

}
let playerReadiness
let playerIndex = 0;

let needToAccaptInfo0 = false;
let needToAccaptInfo1 = false;

function indexSideSocket() {

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

    const gameDiv = document.getElementById('game');
    const gameInfoDiv = document.getElementById('game-info');
    const infoUrl = document.getElementById('roomLink');
    const playerNames = document.getElementsByClassName('playerName')
    playerReadiness = document.getElementsByClassName('button_player')
    const msgForm = document.getElementById('form1');
    const msgInput = document.getElementById('input1');
    const roomForm = document.getElementById('form2');
    const roomInput = document.getElementById('input2');
    const sendMessage = document.getElementById('sendMessage');
    const enterRoom = document.getElementById('enterRoom');
    const createRoom = document.getElementById('createRoom');
    const findGameButton = document.getElementById('find-game-button');
    const foreground = document.getElementById("foreground-container");

    //find game
    findGameButton.addEventListener('click', (event) => {
        socket.emit('findGame');
    })


    //room
    let indexInRoom;
    socket.on('newIndexInRoom', (newIndexInRoom) => {
        indexInRoom = newIndexInRoom;
        console.log(`newIndexInRoom: ${indexInRoom}`);
    })

    let lastInputState;
    let lastPlayerInLine;
    let lastUrl;
    socket.on('update', (msgs) => {

        console.log('update');

        const roomId = msgs[0];
        const room = msgs[1];


        //url
        let currentUrl = (new URL(window.location.href));
        let origin = currentUrl.origin;
        console.log(`origin: '${origin}'`);

        if (infoUrl.getAttribute('value') != `${origin}/game/${roomId}`) {

            infoUrl.setAttribute('value', `${origin}/game/` + roomId);

            history.pushState(null, "", `${origin}/game/` + roomId);
        }

        //users
        for (let i = 0; i < 4; i++) {

            playerNames[i].setAttribute('value', "");
            playerNames[i].setAttribute('style', "");
            playerReadiness[i].setAttribute('value', "");
            playerReadiness[i].setAttribute('style', "");
            playerReadiness[i].innerHTML = "Nicht Bereit";

            if (room.userData[i].name !== null) {
                playerReadiness[i].setAttribute('value', room.userData[i].status);

                playerNames[i].setAttribute('value', room.userData[i].name);
                playerNames[i].style.color = "#b7b7b7";

                if (indexInRoom == i) {
                    playerNames[i].setAttribute('value', room.userData[i].name + " (Du)");
                    playerNames[i].style.color = "#ffffff";
                    playerIndex = i;
                }
                if (room.state) {
                    const playerColor = getColorOfPlayerIndex(getPlayerIndexByNum(room.game.players, room.userData[i].num));
                    playerReadiness[i].innerHTML = playerColor[1];
                    playerReadiness[i].style.backgroundColor = playerColor[0];
                } else {

                    //playerReadiness[i].style.backgroundColor = "white";
                    if (room.userData[i].status == true) {
                        playerReadiness[i].innerHTML = "Bereit";
                    }
                    else {
                        playerReadiness[i].innerHTML = "Nicht Bereit";
                    }
                }
            } else if (room.state) {
                playerReadiness[i].innerHTML = "";
                //playerReadiness[i].style.backgroundColor = "#b7b7b7";
            }
        }

        //game

        gameDrawing: if (room.state) {
            const pawnConteiner = document.getElementById('pawn-container');
            let game = room.game;
            let currentUrl = infoUrl.getAttribute('value');
            if (game.inputState == lastInputState && game.playerInLine == lastPlayerInLine && (currentUrl == lastUrl)) {

                break gameDrawing;
            }
            console.log("gameDrawing");
            messageCounter = 0
            lastInputState = game.inputState;
            lastPlayerInLine = game.playerInLine;
            lastUrl = currentUrl;

            let clientIsPlayerInLine = false;

            //check if client is player in line
            for (let i = 0; i < room.userData.length; i++) {

                if (indexInRoom == i && game.playerInLine == room.userData[i].num) {
                    clientIsPlayerInLine = true;
                }
            }

            // remove old message
            foreground.style.display = "none";

            const conteiner = document.getElementsByClassName("game-message-conteiner");
            console.log(conteiner);
            for (i = conteiner.length - 1; i > -1; i--) {
                const element = conteiner[i];
                console.log(i + " remove element: " + element.id)
                console.log(element);
                element.remove();
            }

            //game-info
            const diceinfo = document.getElementById("dice");
            if (game.inputState == 2 || game.inputState == 1) {
                diceinfo.style.display = "none";
            } else {
                diceinfo.style.display = "inline";
            }
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
            //gameInfo
            if (game.inputState == 1 && game.temp.data && game.temp.data.firstOfInputType) {
                needToAccaptInfo0 = true;
            }
            if (game.inputState == 2 && game.temp.data && game.temp.data.firstOfInputType) {
                needToAccaptInfo1 = true;
            }
            if (needToAccaptInfo1 && game.inputState == 2) {
                createMessage(
                    foreground,
                    "Spieler " + getColorOfPlayerIndex(getPlayerIndexByNum(game.players, game.temp.data.old.player))[1] + " hat die höchste zahl gewürfelt und fängt an",
                    100,
                    "Akzeptieren",
                    () => {
                        needToAccaptInfo1 = false;
                    });
            }
            //dice
            if (clientIsPlayerInLine && (game.inputState == 2 || game.inputState == 1)) {
                createMessage(
                    foreground,
                    "",
                    100,
                    "Würfeln",
                    () => {
                        socket.emit("gameAction", { type: game.inputState });
                        console.log(`output ${game.inputState}`);
                    });
            }
            console.log(game.temp.data);
            if (game.temp.data && game.temp.data.old) {
                createMessage(
                    foreground,
                    "Spieler " + getColorOfPlayerIndex(getPlayerIndexByNum(game.players, game.temp.data.old.player))[1] + " hat eine " + game.temp.data.old.value + " gewürfelt",
                    100,
                    "Akzeptieren", () => { });
            }

            //message
            if (clientIsPlayerInLine && game.inputState == 4) {
                createMessage(
                    foreground, game.temp.msg,
                    100,
                    "Akzeptieren",
                    () => {
                        socket.emit("gameAction", { type: game.inputState, value: 0 });
                        console.log(`output ${game.inputState}`);
                    });
            }
            //gameInfo
            if (needToAccaptInfo0 && game.inputState == 1) {
                createMessage(
                    foreground, "Jeder Spieler würfelt einmal. Der spieler mit der höchsten Zahl beginnt das Spiel.",
                    100,
                    "Akzeptieren",
                    () => {
                        needToAccaptInfo0 = false;
                    });
            }

            //end
            if (game.inputState == 5 && game.winner > -1) {
                const winnerNum = getPlayerIndexByNum(game.players, game.winner);
                const [color, colorText] = getColorOfPlayerIndex(winnerNum);

                createMessage(
                    foreground, `Spieler <span style="color: ${color};"> ${colorText} </span> hat gewonnen!`,
                    100,
                    "Akzeptieren",
                    () => {
                    });
            }
            gameInfoDiv.style.display = "block";
        } else {
            gameInfoDiv.style.display = "none";
            foreground.style.display = "none";
        }
        console.log(msgs);
    });
}