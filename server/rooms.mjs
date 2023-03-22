import { v4 as uuid } from 'uuid';
//room funktions
export function leaveRoom(rooms, roomId, io, socket) {
   try {

      const room = rooms[roomId];
      //remove socket-connection to room
      socket.leave(roomId);

      let roomIndexOfSocket = room.userAuthIds.indexOf(socket.data.authId);
      let timeStamp = Date.now();

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

         //console.log(`check if time changed: '${room.emptySince}' and room is empty '${room.userAuthIds.length}'`);


         io.to(roomId).emit('update', [roomId, room]);
      }, 1000);
   } catch (error) {
      console.log(rooms[roomId]);
      throw new Error(error);
   }
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
         { name: null, status: null, leftSince: 0, index: null },
         { name: null, status: null, leftSince: 0, index: null },
         { name: null, status: null, leftSince: 0, index: null },
         { name: null, status: null, leftSince: 0, index: null }
      ],
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
               io.to(roomId).emit('update', [roomId, room]);
               console.log(`${socket.data.authId} joined room ${roomId}`);
               return true;
            }

         }
      }
      if (alreadyConnected)
         return false

      //check if room is full
      console.log(`check if room is full: ${room.userAuthIds.length}`)
      if (countRoomAuthIds(room.userAuthIds) >= 4) {

         console.log(`${socket.data.authId} did not join room ${roomId} because it was full: ${room.userAuthIds.length}`);
         socket.emit('error', "room full", { roomId: roomId });
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
      room.userData[roomIndexOfSocket] = { name: socket.data.name, status: false, leftSince: 0 };

      socket.join(roomId);
      io.to(roomId).emit('update', [roomId, room]);
      console.log(`${socket.data.authId} joined room ${roomId}`);
      return true;

   } catch (error) {
      console.log(room);
      throw new Error(error);
   }
}

function countRoomAuthIds(userAuthIds) {
   let counter = 0;
   userAuthIds.forEach((authId) => {
      if (authId !== null) {
         counter++;
      }
   });

   return counter;
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
   if (allReady && (countRoomAuthIds(room.userAuthIds) > 1)) {
      room.state = 1;
      let counter = 0
      for (let i = 0; i < room.userAuthIds.length; i++) {
         if (room.userAuthIds[i]) {
            room.userData.index = counter;
            counter++;
         }

      }
   }

   io.to(roomId).emit('update', [roomId, room]);
   console.log("sockets in group:");
   console.log(io.sockets.adapter.rooms);
   console.log("roomId: " + roomId);
   console.log(room);

}