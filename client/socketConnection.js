//connection
let authenticationId = localStorage.getItem('authId');
let loginStatus = false;
const socket = io({ auth: { token: authenticationId, transports: ["polling"] } });

function socketConnection() {

    socket.on("connect", () => {
        console.log(`socketId: ${socket.id}`);
    });

    socket.on('connectionInfo', (loggedIn) => {

        console.log('loginStatus: ' + loggedIn)
        if (loggedIn) {
            logoutLogic();
        }
    })

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

    socket.on('loggedIn',(newAuthenticationId ) => {
        authenticationId = newAuthenticationId;
        localStorage.setItem('authId', newAuthenticationId);
        console.log("new AuthenticationId saved: " + newAuthenticationId);
        
        location.reload();
    });

    //error
    socket.on('error', (msg, data) => {
        console.log(`error message: ${msg}`);
        console.log(data);
        alert(`error message: ${msg}`);
    });


}