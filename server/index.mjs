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

const rooms = {};
const users = {};
const sockets = {};

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html',);
});

app.get('/game/:id2', (req, res) => {
   res.sendFile(__dirname + '/index.html',)
});

io.use(async (socket, next) => {
   console.log(socket.id + ' sent authenticationID: ' + socket.handshake.auth.token);

   console.log("Token:", socket.handshake.auth);

   if (socket.handshake.auth.token == null) {

      let authenticationId

      try {

         let existing = false;
         do {
            authenticationId = uuid();
            authenticationId = authenticationId.replace(/-/g, '')
            console.log('Id: ' + authenticationId);

            const res = await pool.query("SELECT COUNT(*) AS existing FROM users where id = ? ", [`0x${authenticationId}`]);
            
            existing = (res[0].existing != 0n); // 0n == bigint
            console.log("existing: " + existing); // 0n == bigint

         } while (existing);

         await pool.query("INSERT INTO users (id) VALUES (?)", [`0x${authenticationId}`]);

         console.log('Inserted authenticationId in DB');

         socket.emit('new authenticationId', authenticationId);
         console.log("new authenticationId: " + authenticationId);
         socket.data.id = authenticationId;
         next();
      } catch (err) {
         throw err;
      }

   } else {
      // need error catch
      socket.data.id = socket.handshake.auth.token;
      next();
   }
})

io.on('connection', async (socket) => {

   console.log('sockedID connection: ' + socket.id);
   let currentRoomId;
   console.log(socket.data.id + ' user connected ');

   //messages
   socket.on('chat message', (msg) => {
      console.log(socket.data.id + ' message: ' + msg);
      if (currentRoomId) {
         io.to(currentRoomId).emit('chat message', msg);
      }


   });

   //room
   socket.on('change room', (roomid) => {

      console.log(socket.data.id + ' trys to access room: ' + roomid)
      // check if room exists or is the one the user is in
      if (rooms[roomid] && (roomid != currentRoomId)) {
         //leave old room
         if (rooms[currentRoomId]) {
            rooms[currentRoomId].users.splice(rooms[currentRoomId].users.indexOf(socket.data.id), 1)
            socket.leave(currentRoomId);
            // splice old room if empty
            if (rooms[currentRoomId].users.length === 0) {
               delete rooms[currentRoomId];
            }
         }
         console.log(socket.data.id + ' change room form ' + currentRoomId + ' to ' + roomid)
         // enter room
         currentRoomId = roomid;
         rooms[currentRoomId].users.push(socket.data.id);
         socket.join(currentRoomId);
         console.log('corrent room object: ' + JSON.stringify(rooms))

         // send info update
         io.to(currentRoomId).emit('info update', [currentRoomId, rooms[currentRoomId]]);
      }
   });

   socket.on('create room', () => {
      //leave old room
      if (rooms[currentRoomId]) {
         rooms[currentRoomId].users.splice(rooms[currentRoomId].users.indexOf(socket.data.id), 1)
         socket.leave(currentRoomId);
         // remove old room if empty
         if (rooms[currentRoomId].users.length === 0) {
            delete rooms[currentRoomId];
         }
         io.to(currentRoomId).emit('info update', [currentRoomId, rooms[currentRoomId]]);
      }

      //create room
      let tempRoomID
      do {
         tempRoomID = uuid();
         tempRoomID = tempRoomID.replace(/-/g, '');
         tempRoomID = tempRoomID.slice(0, 8)

      } while (rooms[tempRoomID]);
      currentRoomId = tempRoomID;

      rooms[currentRoomId] = { users: [], messages: ["test1", "test2"] };

      // enter room
      rooms[currentRoomId].users.push(socket.data.id);
      socket.join(currentRoomId);
      console.log(socket.data.id + 'created room object: ')
      console.log(rooms);

      // send info update
      io.to(currentRoomId).emit('info update', [currentRoomId, rooms[currentRoomId]]);
   });

   socket.on('disconnect', () => {
      console.log(socket.data.id + ' user disconnected');

      //leave old room
      if (rooms[currentRoomId]) {
         rooms[currentRoomId].users.splice(rooms[currentRoomId].users.indexOf(socket.data.id), 1);

         console.log(rooms[currentRoomId].users.length + ' left in room: ' + currentRoomId);
         console.log(JSON.stringify(rooms[currentRoomId]));
         // splice old room if empty
         if (rooms[currentRoomId].users.length === 0) {
            delete rooms[currentRoomId];
         }
         // send info update
         io.to(currentRoomId).emit('info update', [currentRoomId, rooms[currentRoomId]]);
      }
   });
});

server.listen(3000, () => {
   console.log('listening on *:3000');
});