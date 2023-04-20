import * as mariadb from 'mariadb';
import * as path from 'path';
import * as fs from 'fs';
import { Server } from 'socket.io';
import express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as dotenv from 'dotenv'
import { leaveRoom, createRoom, joinRoom, changeReadiness, formateRoomForUpdate } from './rooms.mjs';
import { fetchUserdata, updateUsername, findUnusedAuthId, addUser, checkAuthId } from './dbInteractions.mjs'
import { handleAction } from 'js-madn'
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

dotenv.config()

const DBOptions = {
   host: process.env.HOST, 
   user: process.env.USER, 
   password: process.env.PASSWORD,
   database: 'lfup'
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
      socket.emit("newUsername", username);
      console.log(`${socket.id} got new Username: ${username}`)
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

            io.to(currentRoomId).emit('update', [currentRoomId, formateRoomForUpdate(room)]);
         }
      } catch (error) {
         console.log(rooms[currentRoomId]);
         throw error;
      }

   })


   //stats
   socket.on('readStats', async () => {
      const stats = await getStats(pool, authId);
      socket.emit('stats', stats)
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
