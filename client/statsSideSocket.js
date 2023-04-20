function indexSideSocket() {

    socket.emit('readStats');

    // 1. element suchen (element-id)

    socket.on('stats', (stats) => {
        stats.playedGames
        // 2. werte schreiben ( = stats.playedgames)
    })
}