import { v4 as uuid } from 'uuid';
import * as mariadb from 'mariadb';
import * as path from 'path';

import { leaveRoom, createRoom, joinRoom } from './rooms.mjs';
import { findUnusedAuthId, addAuthId, checkAuthId } from './auth.mjs'

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
app.use('/game/:id2', express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/game/:id2', (req, res) => {
   res.sendFile(path.join(__dirname, '../client/index.html'));
});


//middleware

io.use(async (socket, next) => {
   console.log(`${socket.id} is trying to logging in with '${socket.handshake.auth.token}'`);

   //create new authenticationId if its not send with handshake
   if (socket.handshake.auth.token == null) {

      let authenticationId = await findUnusedAuthId(pool);
      await addAuthId(authenticationId, pool, socket)
      next();

   } else {

      const authIdOk = await checkAuthId(socket.handshake.auth.token, pool);
      if (!authIdOk) {
         console.log(`${socket.id} wrong authenticationId`);
         next(new Error("wrong authenticationId"));
      } else {
         socket.data.authenticationId = socket.handshake.auth.token;
         next();
      }
   }
})

io.on('connection', async (socket) => {

      console.log(`${socket.id} created a new connection`); //${socket.data.authenticationId}

      const userId = `${socket.id}`; //${socket.data.authenticationId}
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
            leaveRoom(rooms, currentRoomId, userId, io, socket);
         }

         let newRoomId = createRoom(rooms);

         joinRoom(rooms, newRoomId, userId, io, socket);
         currentRoomId = newRoomId;
      });


      socket.on('joinRoom', (roomid) => {

         console.log(`${userId} is trying joining room ${roomid}`);

         // check if room exists
         if (rooms[roomid]) {

            //leave old room
            if (rooms[currentRoomId]) {
               leaveRoom(rooms, currentRoomId, userId, io, socket);
            }
         } else {
            createRoom(rooms, roomid);
         }
         currentRoomId = roomid;
         joinRoom(rooms, currentRoomId, userId, io, socket);
      });

      socket.on('update', (msgs) => {
         console.table(msgs)
      });

      socket.on('disconnect', () => {
         console.log(`${userId} disconnected`);

         //leave old room
         if (rooms[currentRoomId]) {
            leaveRoom(rooms, currentRoomId, userId, io, socket);
         }
      });

});

server.listen(3000, () => {
   console.log('listening on *:3000');
});