import { v4 as uuid } from 'uuid';
//room funktions
export function leaveRoom(rooms, roomId, io, socket) {
   let roomIndexOfSocket = rooms[roomId].users.indexOf(socket.data.authId);
   rooms[roomId].users.splice(roomIndexOfSocket, 1);
   rooms[roomId].userNames.splice(roomIndexOfSocket, 1);
   socket.leave(roomId);

   console.log(`${socket.data.authId} left room ${roomId}`);

   // remove old room if empty
   if (rooms[roomId].users.length === 0) {
      let emptySince = Date.now()
      rooms[roomId].emptySince = emptySince
      console.log(`${rooms[roomId].emptySince} room empty`)
      setTimeout(() => {
         console.log(`check if time changed: '${rooms[roomId].emptySince}' and room is empty '${rooms[roomId].users.length}'`);
         if ((rooms[roomId].emptySince == emptySince) && (rooms[roomId].users.length === 0)) {
            delete rooms[roomId];
            console.log(`${roomId} room delete`);
         } else {
            console.log(`${roomId} rooms kept alive`)
         }
      }, 1000);
   }
   io.to(roomId).emit('update', [roomId, rooms[roomId]]);
}

export function createRoom(rooms) {
   //find unused roomId
   let roomId
   do {
      roomId = uuid();
      roomId = roomId.replace(/-/g, '');
      roomId = roomId.slice(0, 5);

   } while (rooms[roomId]);
   rooms[roomId] = { users: [],userNames: [], emptySince: null };
   console.log(`room created ${roomId}`);
   return roomId
}

export function joinRoom(rooms, roomId, io, socket) {
   //check if room is full
   console.log(`check if room is full: ${rooms[roomId].users.length}`)
   if (rooms[roomId].users.length >= 4) {

      console.log(`${socket.data.authId} did not join room ${roomId} because it was full: ${rooms[roomId].users.length}`);
      socket.emit('error', "room full", {roomId: roomId});
      return false;
   }
   // check if user is already connected on with other socket
   rooms[roomId].users.forEach(element => {
      if (element == socket.data.authId){
         console.log(`${socket.data.authId} did not join room ${roomId} because it was already connected: ${element.authId}`);
         socket.emit('error', "already connected", {roomId: roomId});
      }
   });

   rooms[roomId].users.push(socket.data.authId);
   rooms[roomId].userNames.push(socket.data.name);
   socket.join(roomId);
   io.to(roomId).emit('update', [roomId, rooms[roomId]]);
   console.log(`${socket.data.authId} joined room ${roomId}`);
   return true;
}

