import { v4 as uuid } from 'uuid';
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
import { count } from 'console';
const io = new Server(server);

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html',);
});

app.get('/game/:id2', (req, res) => {
   res.sendFile(__dirname + '/index.html',)
});

const rooms = {};

//middleware
io.use(async (socket, next) => {
   console.log(`${socket.id} is trying to logging in with '${socket.handshake.auth.token}'`);

   //create new authenticationId if its not send with handshake
   if (socket.handshake.auth.token == null) {

      let authenticationId = await findUnusedAuthId(pool);
      await addAuthId(authenticationId, pool, socket)
      next();

   } else {
      
      const authIdOk = checkAuthId(socket.handshake.auth.token);
      if (!authIdOk) {
         console.log(`${socket.id} wrong authenticationId`)
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
         leaveRoom(currentRoomId, userId, io, socket);
      }

      let newRoomId = createRoom();

      joinRoom(newRoomId, userId, io, socket);
      currentRoomId = newRoomId;
      console.log(`${userId} created and joined room ${currentRoomId}`);
   });


   socket.on('joinRoom', (roomid) => {

      console.log(`${userId} is trying joining room ${roomid}`);

      // check if room exists
      if (rooms[roomid]) {

         //leave old room
         if (rooms[currentRoomId]) {
            leaveRoom(currentRoomId, userId, io, socket);
         }
      } else {
         createRoom(roomid);
      }
      currentRoomId = roomid;
      joinRoom(currentRoomId, userId, io, socket);
   });

   socket.on('disconnect', () => {
      console.log(`${userId} disconnected`);

      //leave old room
      if (rooms[currentRoomId]) {
         leaveRoom(currentRoomId, userId, io, socket);
      }
   });
});

//room funktions
function leaveRoom(roomId, userId, io, socket) {
   rooms[roomId].users.splice(rooms[roomId].users.indexOf(userId), 1)
   socket.leave(roomId);

   console.log(`${userId} left room ${roomId}`);

   // remove old room if empty
   if (rooms[roomId].users.length === 0) {
      delete rooms[roomId];
      console.log(`room delete ${roomId}`);
   }

   io.to(roomId).emit('update', [roomId, rooms[roomId]]);
}

function createRoom(roomId) {
   if (!roomId) {
      //find unused roomId
      let newRoomId
      do {
         newRoomId = uuid();
         newRoomId = newRoomId.replace(/-/g, '');
         newRoomId = newRoomId.slice(0, 5);

      } while (rooms[newRoomId]);
      roomId = newRoomId;
   }
   rooms[roomId] = { users: [] };
   console.log(`room created ${roomId}`);
   return roomId
}

function joinRoom(roomId, userId, io, socket) {

   rooms[roomId].users.push(userId);
   socket.join(roomId);
   io.to(roomId).emit('update', [roomId, rooms[roomId]]);
   console.log(`${userId} joined room ${roomId}`);
}

//auth funktions

async function findUnusedAuthId(pool) {

   let authenticationId;
   let resultCount
   do {
      authenticationId = uuid();
      const result = await pool.query("SELECT COUNT(id) as count FROM users WHERE id = (?);", [authenticationId]);
      resultCount = result[0].count;

   } while (resultCount != 0n);
   console.log(`authId found ${authenticationId}`)
   return authenticationId;
}

async function addAuthId(authenticationId, pool, socket) {
   await pool.query("INSERT INTO users (id) VALUES (?)", [authenticationId]);
   await socket.emit('newAuthenticationId', authenticationId);
   console.log(`${socket.id} got new AuthenticationId: ${authenticationId}`);
   socket.data.authenticationId = authenticationId;
}

async function checkAuthId(authenticationId){
   const result = await pool.query("SELECT COUNT(id) as count FROM users WHERE id = (?);", [authenticationId]);
   let resultCount = result[0].count;
   return !(resultCount == 0n)
}

server.listen(3000, () => {
   console.log('listening on *:3000');
});