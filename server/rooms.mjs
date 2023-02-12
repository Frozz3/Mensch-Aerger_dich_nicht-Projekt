import { v4 as uuid } from 'uuid';
//room funktions
export function leaveRoom(rooms, roomId, io, socket) {
   let roomIndexOfSocket = rooms[roomId].userAuthIds.indexOf(socket.data.authId);
   rooms[roomId].userAuthIds.splice(roomIndexOfSocket, 1);
   rooms[roomId].userData.splice(roomIndexOfSocket, 1);
   socket.leave(roomId);

   console.log(`${socket.data.authId} left room ${roomId}`);

   // remove old room if empty
   if (rooms[roomId].userAuthIds.length === 0) {
      let emptySince = Date.now()
      rooms[roomId].emptySince = emptySince
      console.log(`${rooms[roomId].emptySince} room empty`)
      setTimeout(() => {
         console.log(`check if time changed: '${rooms[roomId].emptySince}' and room is empty '${rooms[roomId].userAuthIds.length}'`);
         if ((rooms[roomId].emptySince == emptySince) && (rooms[roomId].userAuthIds.length === 0)) {
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
   rooms[roomId] = { userAuthIds: [],userData: [], emptySince: null };
   console.log(`room created ${roomId}`);
   return roomId
}

export function joinRoom(rooms, roomId, io, socket) {
   
   // check if user is already connected on with other socket
   let alreadyConnected = false;
   rooms[roomId].userAuthIds.forEach(element => {
      if (element == socket.data.authId){
         console.log(`${socket.data.authId} did not join room ${roomId} because it was already connected: ${element.authId}`);
         socket.emit('error', "already connected", {roomId: roomId});
         alreadyConnected = true;
      }
   });
   if (alreadyConnected)
   return false
   
   //check if room is full
   console.log(`check if room is full: ${rooms[roomId].userAuthIds.length}`)
   if (rooms[roomId].userAuthIds.length >= 4) {

      console.log(`${socket.data.authId} did not join room ${roomId} because it was full: ${rooms[roomId].userAuthIds.length}`);
      socket.emit('error', "room full", {roomId: roomId});
      return false;
   }

   rooms[roomId].userAuthIds.push(socket.data.authId);
   rooms[roomId].userData.push({name: socket.data.name});
   socket.join(roomId);
   io.to(roomId).emit('update', [roomId, rooms[roomId]]);
   console.log(`${socket.data.authId} joined room ${roomId}`);
   return true;
}

