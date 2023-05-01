import { v4 as uuid } from 'uuid';

import * as madn from 'js-madn'
//room funktions

export function countRoomAuthIds(userAuthIds) {
   let counter = 0;
   userAuthIds.forEach((authId) => {
      if (authId !== null) {
         counter++;
      }
   });

   return counter;
}

export function formateRoomForUpdate(room) {
   return {
      userData: room.userData,
      game: room.game,
      state: room.state,
   emptySince: room.emptySince
   };
}

export function createRoom(rooms) {
   //find unused roomId
   let roomId
   do {
      roomId = uuid();
      roomId = roomId.replace(/-/g, '');
      roomId = roomId.slice(0, 5);

   } while (rooms[roomId]);
   rooms[roomId] = {
      userAuthIds: [null, null, null, null],
      userData: [
         { name: null, status: null, leftSince: 0, num: null },
         { name: null, status: null, leftSince: 0, num: null },
         { name: null, status: null, leftSince: 0, num: null },
         { name: null, status: null, leftSince: 0, num: null }
      ],
      game: null,
      state: 0,
      emptySince: null
   };
   console.log(`room created ${roomId}`);
   return roomId
}

export function joinRoom(room, roomId, io, socket) {
   try {

      // check if user is already connected on with other socket
      let alreadyConnected = false;
      for (let index = 0; index < room.userAuthIds.length; index++) {
         const element = room.userAuthIds[index];

         if (element == socket.data.authId) {
            if (room.userData[index].leftSince == 0) {
               console.log(`${socket.data.authId} did not join room ${roomId} because it was already connected: ${element.authId}`);
               socket.emit('error', "already connected", { roomId: roomId });
               alreadyConnected = true;
            } else {
               room.userData[index].leftSince = 0;

               socket.join(roomId);
               console.log(`roomIndexOfSocket: ${index}`);
               socket.emit('newIndexInRoom', index);
               io.to(roomId).emit('update', [roomId, formateRoomForUpdate(room)]);
               console.log(`${socket.data.authId} joined room ${roomId}`);
               return true;
            }

         }
      }
      if (alreadyConnected)
         return false

      //check if has started

      if (room.state != 0) {
         console.log(`${socket.data.authId} did not join room ${roomId} because it has already started: ${room.state}`);
         socket.emit('error', "room has started", { roomId: roomId });
         return false;
      }

      //check if room is full
      const numberOfUserAuthIds = countRoomAuthIds(room.userAuthIds);
      if (numberOfUserAuthIds >= 4) {

         console.log(`${socket.data.authId} did not join room ${roomId} because it was full: ${numberOfUserAuthIds}`);
         socket.emit('error', "room is full", { roomId: roomId });
         return false;
      }
      //find empty place in user-array
      let roomIndexOfSocket = (() => {
         for (let index = 0; index < room.userAuthIds.length; index++) {
            if (room.userAuthIds[index] === null)
               return index;
         }
      }
      )();

      room.userAuthIds[roomIndexOfSocket] = socket.data.authId;
      room.userData[roomIndexOfSocket].name = socket.data.name;
      room.userData[roomIndexOfSocket].status = false;
      room.userData[roomIndexOfSocket].leftSince = 0;
      room.userData[roomIndexOfSocket].num = null;

      console.log(`roomIndexOfSocket: ${roomIndexOfSocket}`);
      socket.emit('newIndexInRoom', roomIndexOfSocket);

      socket.join(roomId);
      io.to(roomId).emit('update', [roomId, formateRoomForUpdate(room)]);
      console.log(`${socket.data.authId} joined room ${roomId}`);
      return true;

   } catch (error) {
      console.log(room);
      throw new Error(error);
   }
}

export function leaveRoom(rooms, roomId, io, socket) {
   try {

      const room = rooms[roomId];
      //remove socket-connection to room
      socket.leave(roomId);

      let roomIndexOfSocket = room.userAuthIds.indexOf(socket.data.authId);
      let timeStamp = Date.now();
      console.log("authId:", socket.data.authId);
      console.log(room);

      // store the time the user left (override old)
      room.userData[roomIndexOfSocket].leftSince = timeStamp;

      // if room is empty, set emptysince
      if (countRoomAuthIds(room.userAuthIds) === 0) {
         room.emptySince = timeStamp
         console.log(`${roomId} room empty ${room.emptySince}`)
      }
      //wait for rejoin
      setTimeout(() => {
         //leave room if leftsince has not changed
         if (room.userData[roomIndexOfSocket].leftSince == timeStamp) {
            room.userAuthIds[roomIndexOfSocket] = null;
            room.userData[roomIndexOfSocket] = { name: null, status: null, leftSince: 0 };
            console.log(`${socket.data.authId} removed from room ${roomId}`);

            // remove old room if empty
            if ((room.emptySince == timeStamp) && (countRoomAuthIds(room.userAuthIds) === 0)) {
               delete rooms[roomId];
               console.log(`${roomId} room delete`);
            } else {
               console.log(`${roomId} rooms kept alive`)
            }
         }

         io.to(roomId).emit('update', [roomId, formateRoomForUpdate(room)]);
      }, 1000);
   } catch (error) {
      console.log(error);
      throw new Error(error);
   }
}

export function changeReadiness(room, roomId, io, socket, status) {
   if (!room) {
      return;
   }
   if (room.state == 1) {
      return;
   }
   const userindex = room.userAuthIds.indexOf(socket.data.authId);
   console.log(`${socket.data.authId} has index: ${userindex} and gets status: ${status}`);
   room.userData[userindex].status = status;

   // check if any user is not ready
   let allReady = true;
   room.userData.forEach((data) => {
      if (data.status == false) {
         allReady = false;
      }
   });

   console.log(`allReady: ${allReady}`);

   //console.log(`more then one ${countRoomAuthIds(room.userAuthIds)}`);

   //Update roomstatus if all users are ready
   let numberOfAuthIds = countRoomAuthIds(room.userAuthIds);
   if (!allReady || (numberOfAuthIds <= 1)) {
      console.log("sockets in group:");
      console.log(io.sockets.adapter.rooms);
      console.log("roomId: " + roomId);
      console.log(room);
      io.to(roomId).emit('update', [roomId, formateRoomForUpdate(room)]);
      return;
   }

   room.state = 1;

   let counter = 0
   for (let i = 0; i < room.userAuthIds.length; i++) {
      console.log(`index: ${i} authId: ${room.userAuthIds[i]} counter is: ${counter}`);
      if (room.userAuthIds[i]) {
         room.userData[i].num = counter;
         counter++;
      }
   }

   room.game = madn.createGameObject(numberOfAuthIds);
   io.to(roomId).emit('update', [roomId, formateRoomForUpdate(room)]);
   console.log("roomId: " + roomId);
   console.log(room);

}