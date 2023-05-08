import * as mariadb from 'mariadb';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import { Server } from 'socket.io';
import express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as dotenv from 'dotenv';
import * as login from './login.mjs';
import { countRoomAuthIds, leaveRoom, createRoom, joinRoom, changeReadiness, formateRoomForUpdate } from './rooms.mjs';
import { insertGameStats, getStats, checkLogin, registerUser, fetchUserdata, updateUsername, findUnusedAuthId, addUser, checkAuthId } from './dbInteractions.mjs'
import { handleAction, getPlayerStats } from 'js-madn'
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

dotenv.config({path:__dirname+'../.env'})

const DBOptions = {
   host: process.env.HOST,
   user: process.env.DBUSER,
   password: process.env.PASSWORD,
   database: 'lfup',
   port: process.env.DBPORT,
   allowPublicKeyRetrieval: true
};
// server 

let port = process.env.PORT;
let app = express();
let pool = mariadb.createPool(DBOptions);
let server;

if (process.env.IS_HTTPS == "true") {
   const certOptions = {
      key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
      cert: fs.readFileSync(process.env.HTTPS_CERT_PATH)
   }
   server = https.createServer(certOptions, app);
} else {
   server = http.createServer(app);
}

const io = new Server(server);

const rooms = {};

//routing
app.use(login.login);
app.use('/', express.static(path.join(__dirname, '../client')));
app.use('/game/:roomId', express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/rangliste', (req, res) => {
   res.sendFile(path.join(__dirname, '../client/rangliste.html'));
});

app.get('/game/:roomId', (req, res) => {
   res.sendFile(path.join(__dirname, '../client/index.html'));
});


//middleware

io.use(async (socket, next) => {
   console.log(`${socket.id} is trying to logging in with auth: '${socket.handshake.auth.token}'`);

   if (socket.handshake.auth.token == null) {
      // create new authId
      let authId = await findUnusedAuthId(pool);
      let username = "User" + socket.id.slice(0, 6);
      await addUser(authId, username, pool, socket);
      console.log(`${socket.id} got new Username: ${username}`);
      next();
   } else {
      // check authId from handshake
      const authIdOk = await checkAuthId(socket.handshake.auth.token, pool, socket);
      if (!authIdOk) {
         console.log(`${socket.id} wrong authId`);
         next(new Error("wrong authId"));
      } else {
         // authId valid
         // store data of user in socket
         await fetchUserdata(socket.data, pool);
         socket.emit('connectionInfo', socket.data.loggedIn)
         next();
      }
   }
});

io.on('connection', async (socket) => {


   console.log(`${socket.id} created a new connection`); //${socket.data.authId}

   const userId = `${socket.id}`; //${socket.data.authId}
   let currentRoomId;

   //room

   socket.on('createRoom', () => {

      //leave old room
      if (rooms[currentRoomId]) {
         leaveRoom(rooms, currentRoomId, io, socket);
      }

      let newRoomId = createRoom(rooms);

      joinRoom(rooms[newRoomId], newRoomId, io, socket);
      currentRoomId = newRoomId;
   });


   socket.on('joinRoom', (roomId) => {

      console.log(`${userId} is trying joining room ${roomId}`);

      // check if room exists
      if (!rooms[roomId]) {
         socket.emit('error', "room dose not exist", { roomId: roomId });
         return;
      }

      //leave old room
      if (rooms[currentRoomId]) {
         leaveRoom(rooms, currentRoomId, io, socket);
      }
      //join new room
      let joined_room = joinRoom(rooms[roomId], roomId, io, socket);
      if (joined_room) {
         currentRoomId = roomId;
      }
   });

   socket.on('changeReadiness', (status) => {
      changeReadiness(rooms[currentRoomId], currentRoomId, io, socket, status);
   })

   socket.on('gameAction', (playerAction) => {
      try {

         const room = rooms[currentRoomId];
         if (room.state == 0) {
            return;
         }

         const action = {
            playerNum: room.userData[room.userAuthIds.indexOf(socket.data.authId)].num,
            type: playerAction.type,
            value: playerAction.value
         };

         //do action
         const response = handleAction(room.game, action);
         console.log(action);
         if (!response.ok) {
            console.log(`error: ${response.msg}`)
            socket.emit('error', response.msg, action);
         } else {

            if (room.game.winner > -1) {
               /*
               [
                  { won: false, lostPawns: 0, kicktPawns: 0, roledDices: 6 },
                  { won: false, lostPawns: 0, kicktPawns: 0, roledDices: 4 },
                  { won: false, lostPawns: 0, kicktPawns: 0, roledDices: 6 },
                  { won: false, lostPawns: 0, kicktPawns: 0, roledDices: 5 }
               ]
               */

               // write stats to database

               const gamePlayersStats = getPlayerStats(room.game);

               let playersStats = [];
               for (let i = 0; i < room.userAuthIds.length; i++) {
                  const authId = room.userAuthIds[i];
                  if (authId === null) {
                     continue;
                  }

                  const num = room.userData[i].num;
                  const stats = gamePlayersStats[num];

                  playersStats.push({ authId: authId, stats: stats });
                  // insert into user_games (gamesId, usersId, playedGames, wonGames, lostGames, lostFigures, knockedFigures, timesRolled) select 4, u.id, 1,0,1,5,3, 42 from users u where u.authId = '01634f56-dad4-40ff-b92a-192cc75edca1'; 

               }
               insertGameStats(pool, playersStats);

            }

            io.to(currentRoomId).emit('update', [currentRoomId, formateRoomForUpdate(room)]);
         }
      } catch (error) {
         console.log(rooms[currentRoomId]);
         throw error;
      }

   })

   //stats
   socket.on('readStats', async () => {
      const [stats, ranklist] = await getStats(pool, socket.data.authId);
      socket.emit('stats', stats, ranklist)
   });

   //login
   socket.on('login', async (loginData) => {
      if (currentRoomId) {
         if (countRoomAuthIds(rooms[currentRoomId].userAuthIds) > 1) {
            socket.emit('error', "cant log in, when other are in the same room", { roomId: currentRoomId });
            return;
         }
      }
      if (loginData.name == '') {
         socket.emit('error', "username is empty", { roomId: currentRoomId });
         return;
      }
      if (loginData.pw == '') {
         socket.emit('error', "password is empty", { roomId: currentRoomId });
         return;
      }


      let authId = await checkLogin(pool, loginData.name, loginData.pw)
      if (authId == false) {
         socket.emit('error', "password or username is wrong", { roomId: currentRoomId });
         return;
      }
      socket.emit('loggedIn', authId);
   });

   socket.on('logout', async () => {
      if (rooms[currentRoomId]) {
         leaveRoom(rooms, currentRoomId, io, socket);
      }

      currentRoomId = null;
      let authId = await findUnusedAuthId(pool);
      let username = "User" + socket.id.slice(0, 6);
      await addUser(authId, username, pool, socket);
      socket.emit('loggedIn', authId)
      console.log(`${socket.id} got new Username: ${username}`);
   });

   socket.on('regist', async (registrationData) => {
      if (currentRoomId) {
         if (countRoomAuthIds(rooms[currentRoomId].userAuthIds) > 1) {
            socket.emit('error', "cant registrate, when other are in the same room", { roomId: currentRoomId });
            return;
         }
      }
      if (registrationData.name == '') {
         socket.emit('error', "username is empty", { roomId: currentRoomId });
         return;
      }
      if (registrationData.pw == '') {
         socket.emit('error', "password is empty", { roomId: currentRoomId });
         return;
      }

      let result = await registerUser(pool, socket.data.authId, registrationData.name, registrationData.pw, registrationData.email)
      if (!result.ok) {
         socket.emit('error', `regirtration failed, ${result.msg}`, { roomId: currentRoomId });
         return;
      }
      socket.emit('loggedIn', socket.data.authId);
   });

   socket.on('disconnect', () => {
      console.log(`${userId} disconnected`);

      //leave old room
      if (rooms[currentRoomId]) {
         leaveRoom(rooms, currentRoomId, io, socket);
      }
   });

});

server.listen(port, () => {
   console.log(`listening on *:${port}`);
});
