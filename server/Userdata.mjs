export async function fetchUserdata(socketData, pool) {
    try {
        const result = await pool.query("SELECT * FROM users WHERE id = (?);", [socketData.authId]);
        socketData.name = result[0].username;
    } catch (error) {
        throw error
    }
}
export async function storeUsername(pool, authId, username) {
    try {
        const result = await pool.query("UPDATE users SET username = (?) WHERE id = (?);",[username,authId]);
    } catch (error) {
        throw error
    }
}