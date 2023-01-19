/*
http://localhost:3000
http://localhost:3000/?game=
*/

global.crypto = require('crypto');

//DB
const mariadb = require('mariadb');
const pool = mariadb.createPool({
   host: 'localhost',
   user: 'root',
   database: 'lfup',
   connectionLimit: 5
});

// server 
const { on } = require('events');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const rooms = {};

app.get('/', (req, res) => {
   //var path = require('path');
   res.sendFile('index.html',{ root: "../client/"});
});

app.get('/game/:id2', (req, res) => {
   //console.log('GET-request with parameter:' + req.params.id2)
   //roomid = req.params.id
   res.sendFile('/index.html',{ root: "../client/"});
});



io.use((socket, next) => {
   console.log(socket.id + ' sended authenticationID: ' + socket.handshake.auth.token);

   if (socket.handshake.auth.token == null) {

      let authenticationId
      (async () => {
         let conn;
         try {
            conn = await pool.getConnection();
            let existing = false;
            do {

               authenticationId = crypto.randomUUID();
               authenticationId = authenticationId.replace(/-/g, '')
               console.log('Id: ' + authenticationId);

               const res = await conn.query(
                  "SELECT COUNT(*) AS existing FROM users where id = 0x"
                  + authenticationId
               );
               existing = (res[0].existing != 0n); // 0n == bigint
               console.log("existing: " + existing); // 0n == bigint

            } while (existing);
            let conn1 = await pool.getConnection();
               const res1 = await conn1.query(
                  "INSERT INTO users (id) VALUES (0x"+ authenticationId +")"
               );
               //OkPacket { affectedRows: 1, insertId: 0n, warningStatus: 0 }
               
               console.log('Inserted authenticationId in DB');

            socket.emit('new authenticationId', authenticationId);
            console.log("new authenticationId: " + authenticationId);
            socket.data.id = authenticationId;
            next();
         } catch (err) {
            throw err;
         } finally {
            if (conn) return conn.end();
         }
      })();
   } else {
      // need error catch
      socket.data.id = socket.handshake.auth.token;
      next();
   }
})
   .on('connection', (socket) => {

      let currentRoomId;
      console.log(socket.data.id + ' user connected ');
      //io.emit('info update', user);


      //authentication

      socket.on('request authenticationId', () => {

         console.log(socket.data.id + ' request authenticationId');

         (async () => {
            let conn;
            try {
               conn = await pool.getConnection();
               let authenticationId
               let existing = false;
               do {

                  authenticationId = crypto.randomUUID();
                  authenticationId = authenticationId.replace(/-/g, '');
                  console.log('Id: ' + authenticationId);

                  const res = await conn.query(
                     "SELECT COUNT(*) AS existing FROM users where id = 0x"
                     + authenticationId
                  );
                  existing = (res[0].existing != 0n); // 0n == bigint
                  console.log("existing: " + existing); // 0n == bigint

               } while (existing);
               let conn1 = await pool.getConnection();
               const res1 = await conn1.query(
                  "INSERT INTO users (id) VALUES (0x"+ authenticationId +")"
               );

               //OkPacket { affectedRows: 1, insertId: 0n, warningStatus: 0 }
               console.log('Inserted authenticationId in DB');

               socket.emit('new authenticationId', authenticationId);
               console.log("new authenticationId: " + authenticationId);
            } catch (err) {
               throw err;
            } finally {
               if (conn) return conn.end();
            }
         })();
      });

      socket.on('send authenticationId', (authenticationId) => {

         console.log(socket.data.id + ' send authenticationId');
         (async () => {
            let conn;
            try {
               conn = await pool.getConnection();
               console.log('Id: ' + authenticationId);
               const res = await conn.query(
                  "SELECT COUNT(*) AS existing FROM users where id = 0x"
                  + authenticationId
               );
               existing = (res[0].existing != 0n); // 0n == bigint
               console.log("existing: " + existing); // 0n == bigint

               if (existing) authId = authenticationId;

            } catch (err) {
               throw err;
            } finally {
               if (conn) return conn.end();
            }
         })();
      });

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
            // splice old room if empty
            if (rooms[currentRoomId].users.length === 0) {
               delete rooms[currentRoomId];
            }
            io.to(currentRoomId).emit('info update', [currentRoomId, rooms[currentRoomId]]);
         }

         //create room
         let tempRoomID
         do {
            tempRoomID = crypto.randomUUID();
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