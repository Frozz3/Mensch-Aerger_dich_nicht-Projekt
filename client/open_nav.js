function open_nav() {
    var nav = document.getElementById("nav-list");
    let navId = nav.id;
    console.log(`id of NAV: ${navId}`);
    console.log(`classes: ${nav.classList}`);
    //.dontShowOnSmall
    if (nav.classList.contains("dontShowOnSmall")){

        nav.classList.remove("dontShowOnSmall");
    } else {
        nav.classList.add("dontShowOnSmall");
    }
}