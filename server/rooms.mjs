import { v4 as uuid } from 'uuid';
//room funktions
export function leaveRoom(rooms, roomId, io, socket) {
   const room = rooms[roomId]
   let roomIndexOfSocket = room.userAuthIds.indexOf(socket.data.authId);
   room.userAuthIds.splice(roomIndexOfSocket, 1);
   room.userData.splice(roomIndexOfSocket, 1);
   socket.leave(roomId);

   console.log(`${socket.data.authId} left room ${roomId}`);

   // remove old room if empty
   if (room.userAuthIds.length === 0) {
      let emptySince = Date.now()
      room.emptySince = emptySince
      console.log(`${room.emptySince} room empty`)
      setTimeout(() => {
         console.log(`check if time changed: '${room.emptySince}' and room is empty '${room.userAuthIds.length}'`);
         if ((room.emptySince == emptySince) && (room.userAuthIds.length === 0)) {
            delete rooms[roomId];
            console.log(`${roomId} room delete`);
         } else {
            console.log(`${roomId} rooms kept alive`)
         }
      }, 1000);
   }
   io.to(roomId).emit('update', [roomId, room]);
}

export function createRoom(rooms) {
   //find unused roomId
   let roomId
   do {
      roomId = uuid();
      roomId = roomId.replace(/-/g, '');
      roomId = roomId.slice(0, 5);

   } while (rooms[roomId]);
   rooms[roomId] = { userAuthIds: [],userData: [], emptySince: null };
   console.log(`room created ${roomId}`);
   return roomId
}

export function joinRoom(room, roomId, io, socket) {
   
   // check if user is already connected on with other socket
   let alreadyConnected = false;
   room.userAuthIds.forEach(element => {
      if (element == socket.data.authId){
         console.log(`${socket.data.authId} did not join room ${roomId} because it was already connected: ${element.authId}`);
         socket.emit('error', "already connected", {roomId: roomId});
         alreadyConnected = true;
      }
   });
   if (alreadyConnected)
   return false
   
   //check if room is full
   console.log(`check if room is full: ${room.userAuthIds.length}`)
   if (room.userAuthIds.length >= 4) {

      console.log(`${socket.data.authId} did not join room ${roomId} because it was full: ${rooms[roomId].userAuthIds.length}`);
      socket.emit('error', "room full", {roomId: roomId});
      return false;
   }

   room.userAuthIds.push(socket.data.authId);
   room.userData.push({name: socket.data.name, status:false});
   socket.join(roomId);
   io.to(roomId).emit('update', [roomId, room]);
   console.log(`${socket.data.authId} joined room ${roomId}`);
   return true;
}

export function changeReadiness(room,roomId, io, socket, status){
   const userindex = room.userAuthIds.indexOf(socket.data.authId);
   room.userData[userindex].status = status;
   io.to(roomId).emit('update', [roomId, room]);
}

