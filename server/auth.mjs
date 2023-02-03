import { v4 as uuid } from 'uuid';


//auth funktions

export async function findUnusedAuthId(pool) {
   try {
      let authenticationId;
      let resultCount
      do {
         authenticationId = uuid();
         const result = await pool.query("SELECT COUNT(id) as count FROM users WHERE id = (?);", [authenticationId]);
         resultCount = result[0].count;

      } while (resultCount != 0n);
      console.log(`unused authId found ${authenticationId}`)
      return authenticationId;
   } catch (error) {
      throw error
   }


}

export async function addAuthId(authenticationId, pool, socket) {
   try {
      await pool.query("INSERT INTO users (id) VALUES (?)", [authenticationId]);
      await socket.emit('newAuthenticationId', authenticationId);
      console.log(`${socket.id} got new AuthenticationId: ${authenticationId}`);
      socket.data.authenticationId = authenticationId;
   } catch (error) {
      throw error
   }
}

export async function checkAuthId(authenticationId, pool, socket) {
   try {
      const result = await pool.query("SELECT COUNT(id) as count FROM users WHERE id = (?);", [authenticationId]);
      let resultCount = result[0].count;
      if (resultCount == 0n) {
         console.log(`wrong authenticationId ${authenticationId}`);
         return false
      } else
         socket.data.authenticationId = socket.handshake.auth.token;
      return true;
   } catch (error) {
      throw error
   }
}
