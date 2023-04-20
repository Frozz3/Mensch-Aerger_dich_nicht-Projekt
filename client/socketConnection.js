//connection
let authenticationId = localStorage.getItem('authId');
const socket = io({ auth: { token: authenticationId } });

socket.on("connect", () => {
    console.log(`socketId: ${socket.id}`);
});

socket.on("connect_error", (err) => {
    console.log("connection error");
    console.table(err);
    alert(`connect_error message: ${err.message}`);
});

//user

socket.on('newAuthenticationId', function (newAuthenticationId) {
    authenticationId = newAuthenticationId;
    localStorage.setItem('authId', newAuthenticationId);
    console.log("new AuthenticationId saved: " + newAuthenticationId);
});

socket.on('newUsername', function (newUsername) {
    newUsername = newUsername;
    console.log("new Username received: " + newUsername);
});

//error

socket.on('error', (msg, data) => {
    console.log(`error message: ${msg}`);
    console.log(data);
    alert(`error message: ${msg}`);
});


