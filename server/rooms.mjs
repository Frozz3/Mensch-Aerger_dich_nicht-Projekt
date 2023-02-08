import { v4 as uuid } from 'uuid';
//room funktions
export function leaveRoom(rooms, roomId, userId, io, socket) {
   rooms[roomId].users.splice(rooms[roomId].users.indexOf(userId), 1)
   socket.leave(roomId);

   console.log(`${userId} left room ${roomId}`);

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
         }else{
            console.log(`${roomId} rooms kept alive`)
         }
      }, 1000);
   }
   io.to(roomId).emit('update', [roomId, rooms[roomId]]);
}

export function createRoom(rooms, roomId) {
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
   rooms[roomId] = { users: [], emptySince: null };
   console.log(`room created ${roomId}`);
   return roomId
}

export function joinRoom(rooms, roomId, userId, io, socket) {
   console.log(`check if room is full: ${rooms[roomId].users.length}`)
   if (rooms[roomId].users.length >= 4){
      
      console.log(`${userId} did not join room ${roomId} because it was full: ${rooms[roomId].users.length}`);
      socket.emit('error', "room full", {roomId: roomId});
      return false;
   }
   rooms[roomId].users.push(userId);
   socket.join(roomId);
   io.to(roomId).emit('update', [roomId, rooms[roomId]]);
   console.log(`${userId} joined room ${roomId}`);
   return true
}

