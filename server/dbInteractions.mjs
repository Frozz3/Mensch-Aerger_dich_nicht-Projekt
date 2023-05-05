import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

const saltRounds = 10;


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
      await pool.query("INSERT INTO users (authId, username) VALUES (?,?)", [authId, username]);
      console.log(`${socket.id} got new authId: ${authId}`);
      socket.data.authId = authId;
      socket.data.name = username;
      await socket.emit('newAuthenticationId', authId);
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
      const result = await pool.query("select ld.id ldId, u.* from users u left join login_data ld on u.id = ld.usersId WHERE u.authId = (?);", [socketData.authId]);
      socketData.name = result[0].username;
      socketData.loggedIn = (result[0].ldId == null) ? false : true;
      console.log(socketData.logedIn);
   } catch (error) {
      throw error;
   }
}
export async function updateUsername(pool, authId, username) {
   try {
      const result = await pool.query("UPDATE users SET username = (?) WHERE authId = (?);", [username, authId]);
   } catch (error) {
      throw error;
   }
}

export async function getStats(pool, authId) {
   try {
      let result = await pool.query(
         "select cs.playedGames, cs.wonGames, cs.lostGames, cs.lostFigures, cs.timesRolled, cs.knockedFigures FROM current_stats cs JOIN users u on cs.usersId = u.id WHERE u.authId = (?)",
         [authId]
      );

      if (result.length == 0) {
         result[0] = {
            playedGames: 0,
            wonGames: 0,
            lostGames: 0,
            lostFigures: 0,
            timesRolled: 0,
            knockedFigures: 0
         };
      }
      let result1 = await pool.query(
         " select wonGames, username from current_stats c join users u on c.usersId = u.id order by wonGames desc limit 10;"
      );

      if(result1.length == 0){
         result1[0] = {
            wonGames: null,
            username: null
         };
      }

      return [result[0], result1];

   } catch (error) {
      throw error;
   }
}
export async function registerUser(pool, authId, name, pw, email) {
   try {
      const result = await pool.query("select count(ld.id) existing from login_data ld join users u on u.id = ld.usersId where u.authId = (?);", [authId]);
      let registrated = (result[0].existing != 0n);
      if (registrated) {
         return { ok: false, msg: "already logged in" };
      }
      const result1 = await pool.query("select count(*) existing from users where username = (?);", [name]);
      let usernameInUse = (result1[0].existing != 0n);
      if (usernameInUse) {
         return { ok: false, msg: "username already in use" };
      }

      const hash = await bcrypt.hash(pw, saltRounds);
      console.log(hash)
      await pool.query("insert into login_data (usersId, email, password) select id, (?),(?) from users where authId = (?);", [email, hash, authId]);

      await pool.query("update users set username = (?) where authId = (?);", [name, authId]);
      return { ok: true };
   } catch (err) {
      throw new Error(err)
   }
}

export async function checkLogin(pool, name, pw) {
   try {
      const result = await pool.query("select login_data.*, users.authId from users join login_data on login_data.usersId = users.id where users.username = (?);", [name])

      let authId;
      for (let i = 0; i < result.length; i++) {
         const user = result[i];
         if (bcrypt.compareSync(pw, user.password)) {
            return user.authId;
         }
      }
      return false;
   } catch (err) {
      throw new Error(err)
   }

}

export async function insertGameStats(pool, playersStats) {
   const result = await pool.query(
       "insert into games () values ();"
   );
   //console.log(result);
   const gameId = Number(result.insertId);

   for (let i = 0; i < playersStats.length; i++) {
       const authId = playersStats[i].authId;
       const stats = playersStats[i].stats;

       const result = await pool.query(
           "insert into user_games ( usersId, playedGames, gamesId, wonGames, lostGames, lostFigures, knockedFigures, timesRolled) " +
           "select  u.id, 1,(?),(?),(?),(?),(?), (?) from users u where u.authId = (?);",
           [
               gameId,
               stats.won ? 1 : 0,
               stats.won ? 0 : 1,
               stats.lostPawns,
               stats.kicktPawns,
               stats.roledDices,
               authId
           ]
       );
       //console.log(result);
   }
   console.log("inserted stats");
}