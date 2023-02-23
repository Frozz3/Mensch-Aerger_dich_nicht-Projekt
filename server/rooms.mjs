import { v4 as uuid } from 'uuid';
//room funktions
export function leaveRoom(rooms, roomId, io, socket) {
   const room = rooms[roomId];
   //remove socket-connection to room
   socket.leave(roomId);

   let roomIndexOfSocket = getIndexInRoom(socket.data.authId, room,)
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
         room.userData[roomIndexOfSocket] = { name: null, status: false, leftSince: 0 };
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
         { name: null, status: false, leftSince: 0 },
         { name: null, status: false, leftSince: 0 },
         { name: null, status: false, leftSince: 0 },
         { name: null, status: false, leftSince: 0 }
      ],
      roomstate: 0,
      emptySince: null
   };
   console.log(`room created ${roomId}`);
   return roomId
}

export function joinRoom(room, roomId, io, socket) {

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

      console.log(`${socket.data.authId} did not join room ${roomId} because it was full: ${rooms[roomId].userAuthIds.length}`);
      socket.emit('error', "room full", { roomId: roomId });
      return false;
   }

   let roomIndexOfSocket = getIndexInRoom(null, room)
   room.userAuthIds[roomIndexOfSocket] = socket.data.authId;
   room.userData[roomIndexOfSocket] = { name: socket.data.name, status: false, leftSince: 0 };
   
   socket.join(roomId);
   io.to(roomId).emit('update', [roomId, room]);
   console.log(`${socket.data.authId} joined room ${roomId}`);
   return true;
}

function countRoomAuthIds(userAuthIds) {
   let counter = 0;
   userAuthIds.forEach((authId) => {
      if (authId !== null) {
         counter++;
      }
      return counter;
   });
}

function getIndexInRoom(authIdToFind, room) {
   for (let index = 0; index < room.userAuthIds.length; index++) {
      if (room.userAuthIds[index] === authIdToFind) {
         return index;
      }
   };
   throw new Error("AuthId not in room")
}

export function changeReadiness(room, roomId, io, socket, status) {
   const userindex = room.userAuthIds.indexOf(socket.data.authId);
   room.userData[userindex].status = status;

   // check if room can change state
   let canChangeState = true;
   if (room.userData[0].status == false) {
      canChangeState = false;
   }
   if (room.userData[1].status == false) {
      canChangeState = false;
   }
   if (canChangeState == true) {
      room.status = 1;
      console.log(`roomestate: ${room.status} `);
   }

   io.to(roomId).emit('update', [roomId, room]);
}

