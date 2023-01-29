import { v1 as uuid } from 'uuid';
import * as mariadb from 'mariadb';

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

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html',);
});

app.get('/game/:id2', (req, res) => {
   res.sendFile(__dirname + '/index.html',)
});

const rooms = {};
const users = {};
const sockets = {};

//middleware
io.use(async (socket, next) => {
   console.log(socket.id + ' is logging in with ' + socket.handshake.auth.token);

   if (socket.handshake.auth.token == null) {

      const authenticationId = uuid();

      await pool.query("INSERT INTO users (id) VALUES (?)", [authenticationId]);


      socket.emit('newAuthenticationId', authenticationId);
      console.log("newAuthenticationId: " + authenticationId);

      socket.data.authenticationId = authenticationId;
      next();

   } else {
      socket.data.authenticationId = socket.handshake.auth.token;
      next();
   }
})

io.on('connection', async (socket) => {
   console.log(`new connection with id ${socket.id} and auth ${socket.data.authenticationId}`);

   //jede connection ist eine neue socket.id

   const userId = `${socket.data.authenticationId}${socket.id}`;
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

      if (rooms[currentRoomId]) {
         //if user is already in a room, leave that one

         rooms[currentRoomId].users.splice(rooms[currentRoomId].users.indexOf(userId), 1)
         socket.leave(currentRoomId);

         // remove old room if empty
         if (rooms[currentRoomId].users.length === 0) {
            delete rooms[currentRoomId];
         }

         io.to(currentRoomId).emit('update', [currentRoomId, rooms[currentRoomId]]);
      }

      //create room
      let tempRoomID
      do {
         tempRoomID = uuid();
         tempRoomID = tempRoomID.replace(/-/g, '');
         tempRoomID = tempRoomID.slice(0, 8)

      } while (rooms[tempRoomID]);
      currentRoomId = tempRoomID;

      rooms[currentRoomId] = { users: [] };

      // add user to room and join
      rooms[currentRoomId].users.push(userId);
      socket.join(currentRoomId);

      console.log(`${userId} created and joined room ${currentRoomId}`)

      io.to(currentRoomId).emit('update', [currentRoomId, rooms[currentRoomId]]);
   });


   socket.on('joinRoom', (roomid) => {

      console.log(`${userId} is joining room ${roomid}`);

      // check if room exists or is the one the user is in
      if (rooms[roomid] && (roomid != currentRoomId)) {

         //leave old room
         if (rooms[currentRoomId]) {

            rooms[currentRoomId].users.splice(rooms[currentRoomId].users.indexOf(userId), 1)
            socket.leave(currentRoomId);

            // remove old room if empty
            if (rooms[currentRoomId].users.length === 0) {
               delete rooms[currentRoomId];
            }

            io.to(currentRoomId).emit('update', [currentRoomId, rooms[currentRoomId]]);
         }

         console.log(`${userId} is traveling to ${roomid}`);

         currentRoomId = roomid;
         rooms[currentRoomId].users.push(userId);

         socket.join(currentRoomId);

         // send info update
         io.to(currentRoomId).emit('update', [currentRoomId, rooms[currentRoomId]]);
      }
   });

   socket.on('disconnect', () => {
      console.log(`${userId} disconnected`);

      //leave old room
      if (rooms[currentRoomId]) {

         rooms[currentRoomId].users.splice(rooms[currentRoomId].users.indexOf(userId), 1)
         socket.leave(currentRoomId);

         // remove old room if empty
         if (rooms[currentRoomId].users.length === 0) {
            delete rooms[currentRoomId];
         }

         io.to(currentRoomId).emit('update', [currentRoomId, rooms[currentRoomId]]);
      }
   });
});

server.listen(3000, () => {
   console.log('listening on *:3000');
});