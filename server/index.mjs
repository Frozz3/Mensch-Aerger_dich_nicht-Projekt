import * as mariadb from 'mariadb';
import * as path from 'path';
import * as fs from 'fs';

import express from 'express';
import * as http from 'http';
import * as https from 'https';
import { leaveRoom, createRoom, joinRoom, changeReadiness } from './rooms.mjs';
import { findUnusedAuthId, addAuthId, checkAuthId } from './auth.mjs'
import { fetchUserdata, storeUsername } from './Userdata.mjs'

// generatin __dirname for modules
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));



const httpPort = 3000;
const httpsPort = 443;

const testDBOptions = {
   host: 'localhost',
   user: 'root',
   database: 'lfup'
};

const serverDBOptions = {
   host: '127.0.0.1',
   user: 'root',
   database: 'lfup',
   password: 'imPW4Hnfd4cW3XbsWehp'
};





// server 



let port;
let app;
let pool;
let server;

switch (1) {
   case 1:
      port = httpPort;
      app = express();
      pool = mariadb.createPool(testDBOptions);
      server = http.createServer(app);
      break;
   case 2:
      
      port = httpsPort;
      app = express();
      pool = mariadb.createPool(serverDBOptions);

      const certOptions = {
         key: fs.readFileSync('/etc/letsencrypt/live/madn.it-assistant.de/privkey.pem'),
         cert: fs.readFileSync('/etc/letsencrypt/live/madn.it-assistant.de/fullchain.pem')
      }
      
      server = https.createServer(certOptions, app);
      break;

   default:
      break;
}






import { Server } from 'socket.io';
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
      await addAuthId(authId, pool, socket);
      let username = "User" + socket.id.slice(0, 6);
      await storeUsername(pool, authId, username);
      socket.data.name = username;
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

   //messages
   socket.on('chatMessage', (msg) => {
      console.log(socket.id + ' message: ' + msg);

      if (currentRoomId) {
         //send message to all users in room
         io.to(currentRoomId).emit('chatMessage', msg);
      }
   });

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
      if (rooms[roomId].state != 0) {
         socket.emit('error', "room has started", { roomId: roomId });
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
      let room = rooms[currentRoomId]
      if (room.state == 0) {
         return;
      }
      let Roomindex

      let action = {
         playerNum: 0,
         type: playerAction.type,
         value: playerAction.value
      };

      //do action

      //update
   })

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
