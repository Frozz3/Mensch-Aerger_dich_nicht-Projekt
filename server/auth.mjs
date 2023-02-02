
import * as mariadb from 'mariadb';

//auth funktions

export async function findUnusedAuthId(pool) {

    let authenticationId;
    let resultCount
    do {
       authenticationId = uuid();
       const result = await pool.query("SELECT COUNT(id) as count FROM users WHERE id = (?);", [authenticationId]);
       resultCount = result[0].count;
 
    } while (resultCount != 0n);
    console.log(`authId found ${authenticationId}`)
    return authenticationId;
 }
 
export async function addAuthId(authenticationId, pool, socket) {
    await pool.query("INSERT INTO users (id) VALUES (?)", [authenticationId]);
    await socket.emit('newAuthenticationId', authenticationId);
    console.log(`${socket.id} got new AuthenticationId: ${authenticationId}`);
    socket.data.authenticationId = authenticationId;
 }
 
export async function checkAuthId(authenticationId, pool) {
    const result = await pool.query("SELECT COUNT(id) as count FROM users WHERE id = (?);", [authenticationId]);
    let resultCount = result[0].count;
    if (resultCount == 0n) {
       console.log(`wrong authenticationId ${authenticationId}`);
       return false
    } else {
 
    }
 }
 