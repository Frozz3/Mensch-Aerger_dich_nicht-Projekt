import { v4 as uuid } from 'uuid';


//auth funktions

export async function findUnusedAuthId(pool) {
   try {
      let authId;
      let resultCount;
      do {
         authId = uuid();
         const result = await pool.query("SELECT COUNT(id) as count FROM users WHERE authId = (?);", [authId]);
         resultCount = result[0].count;

      } while (resultCount != 0n);
      console.log(`unused authId found ${authId}`)
      return authId;
   } catch (error) {
      throw error;
   }


}

export async function addUser(authId, username, pool, socket) {
   try {
      await pool.query("INSERT INTO users (authId, username) VALUES (?,?)", [authId,username]);
      await socket.emit('newAuthenticationId', authId);
      console.log(`${socket.id} got new authId: ${authId}`);
      socket.data.authId = authId;
      socket.data.name = username;
   } catch (error) {
      throw error;
   }
}

export async function checkAuthId(authId, pool, socket) {
   try {
      const result = await pool.query("SELECT COUNT(authId) as count FROM users WHERE authId = (?);", [authId]);
      let resultCount = result[0].count;
      if (resultCount == 0n) {
         console.log(`wrong authId ${authId}`);
      return false;
      } else
         socket.data.authId = socket.handshake.auth.token;
      return true;
   } catch (error) {
      throw error;
   }
}

export async function fetchUserdata(socketData, pool) {
    try {
        const result = await pool.query("SELECT * FROM users WHERE authId = (?);", [socketData.authId]);
        socketData.name = result[0].username;
    } catch (error) {
        throw error;
    }
}
export async function updateUsername(pool, authId, username) {
    try {
        const result = await pool.query("UPDATE users SET username = (?) WHERE authId = (?);",[username,authId]);
    } catch (error) {
        throw error;
    }
}