import { v4 as uuid } from 'uuid';
//room funktions
export function leaveRoom(rooms, roomId, userId, io, socket) {
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
 
 export  function createRoom(rooms, roomId) {
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
 
 export function joinRoom(rooms, roomId, userId, io, socket) {
 
    rooms[roomId].users.push(userId);
    socket.join(roomId);
    io.to(roomId).emit('update', [roomId, rooms[roomId]]);
    console.log(`${userId} joined room ${roomId}`);
 }

  