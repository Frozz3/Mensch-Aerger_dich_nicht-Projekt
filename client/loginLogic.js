function logoutLogic() {
    document.getElementsByClassName("tab-content1").item(0).style.display = "block";
    document.getElementsByClassName("tab-header").item(0).style.display = "none";
    document.getElementsByClassName("tab-content").item(0).style.display = "none";
    document.getElementById('login-button').style.display = 'none';
    document.getElementById('logout-button').style.display = 'inline';

    let logoutBtn = document.getElementById("logout-btn");
    
    logoutBtn.addEventListener("click", () => {
        socket.emit("logout");
        console.log("request logout");

    });
}
function loginLogic() {

    let loginBtn = document.getElementById("log-btn");
    let registBtn = document.getElementById("reg-btn");

    loginBtn.addEventListener("click", () => {
        let name = document.getElementById("log-name").value;
        let pw = document.getElementById("log-pw").value;
        socket.emit("login", { pw: pw, name: name });
        console.log("request login");

    });

    registBtn.addEventListener("click", () => {
        let name = document.getElementById("reg-name").value;
        let pw = document.getElementById("reg-pw").value;
        let email = document.getElementById("reg-email").value;
        socket.emit("regist", { pw: pw, name: name, email: email })
        console.log("request registration");
    });
}