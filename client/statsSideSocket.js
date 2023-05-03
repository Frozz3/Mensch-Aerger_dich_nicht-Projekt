function indexSideSocket() {

    socket.emit('readStats');

    // 1. element suchen (element-id)
    let playedGames = document.querySelector("#stat-played-games > div > .numbersp");
    let wonGames = document.querySelector("#stat-won-games > div > .numbersp"); 
    let lostGames = document.querySelector("#stat-lost-games > div > .numbersp"); 
    let lostPawns = document.querySelector("#stat-lost-pawns > div > .numbersp");
    let kickedPawns = document.querySelector("#stat-kicked-pawns > div > .numbersp");
    let roledDices = document.querySelector("#stat-roled-dices > div > .numbersp");

    socket.on('stats', (stats) => {
        console.log("stats");
        console.log(stats);
        playedGames.innerHTML = stats.playedGames;
        wonGames.innerHTML = stats.wonGames;
        lostGames.innerHTML = stats.lostGames;
        lostPawns.innerHTML = stats.lostFigures;
        kickedPawns.innerHTML = stats.knockedFigures;
        roledDices.innerHTML = stats.timesRolled;
        // 2. werte schreiben ( = stats.playedgames)
    })
}