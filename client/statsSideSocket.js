function indexSideSocket() {

    socket.emit('readStats');

    const playedGames = document.querySelector("#stat-played-games > div > .numbersp");
    const wonGames = document.querySelector("#stat-won-games > div > .numbersp"); 
    const lostGames = document.querySelector("#stat-lost-games > div > .numbersp"); 
    const lostPawns = document.querySelector("#stat-lost-pawns > div > .numbersp");
    const kickedPawns = document.querySelector("#stat-kicked-pawns > div > .numbersp");
    const roledDices = document.querySelector("#stat-roled-dices > div > .numbersp");

    const rankPlace = document.querySelector("#rankedT > .platz");
    const rankPlayer = document.querySelector("#rankedT > .spieler");
    const rankWins = document.querySelector("#rankedT > .siege");

    socket.on('stats', (name,stats,ranklist) => {
        console.log("name");
        console.log(name);

        //name
        
        console.log("stats");
        console.log(stats);
        playedGames.innerHTML = stats.playedGames;
        wonGames.innerHTML = stats.wonGames;
        lostGames.innerHTML = stats.lostGames;
        lostPawns.innerHTML = stats.lostFigures;
        kickedPawns.innerHTML = stats.knockedFigures;
        roledDices.innerHTML = stats.timesRolled;
        
        let rankPlaceContent = [];
        let rankPlayerContent = [];
        let rankWinsContent = [];
        
        console.log('ranklist');
        console.log(ranklist);
        
        for (let i = 0; i < ranklist.length; i++) {
            const element = ranklist[i];
            const number = (i + 1) + "."

            let place = document.createElement("p");
            let player = document.createElement("p");
            let wins = document.createElement("p");

            place.innerHTML = number;
            player.innerHTML =  element.username;
            wins.innerHTML = element.wonGames

            rankPlaceContent[i] = place;
            rankPlayerContent[i] = player;
            rankWinsContent[i] = wins;

        }
        rankPlace.replaceChildren(...rankPlaceContent);
        rankPlayer.replaceChildren(...rankPlayerContent);
        rankWins.replaceChildren(...rankWinsContent);
    })
}