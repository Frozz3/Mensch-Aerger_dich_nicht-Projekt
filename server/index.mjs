import * as mariadb from 'mariadb';
import * as path from 'path';

import { leaveRoom, createRoom, joinRoom, changeReadiness } from './rooms.mjs';
import { findUnusedAuthId, addAuthId, checkAuthId } from './auth.mjs'
import { fetchUserdata, storeUsername } from './Userdata.mjs'

const port = 3000; 

const pool = mariadb.createPool({
   host: 'localhost',
   user: 'root',
   database: 'lfup'
});

// generatin __dirname for modules
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// server 
import express from 'express';
const app = express();

import * as http from 'http';

const server = http.createServer(app);

import { Server } from 'socket.io';
const io = new Server(server);

const rooms = {};

//routing

app.use('/', express.static(path.join(__dirname, '../client')));
app.use('/game/:roomId', express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, '../client/index.html'));
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
      let username = "User" + socket.id.slice(0,6);
      await storeUsername(pool,authId,username);
      socket.data.name = username;
      socket.emit("newUsername",username);
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
         await fetchUserdata(socket.data,pool);
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
      if (rooms[roomId]) {

         //leave old room
         if (rooms[currentRoomId]) {
            leaveRoom(rooms, currentRoomId, io, socket);
         }

         currentRoomId = roomId;
         joinRoom(rooms[currentRoomId], currentRoomId, io, socket);

      } else {
         socket.emit('error', "room dose not exist", {roomId: roomId});
      }
   });

   socket.on('changeReadiness', (status) => {
      changeReadiness(rooms[currentRoomId], currentRoomId, io, socket, status);
   })

   socket.on('', (msgs) => {
      console.table(msgs)
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