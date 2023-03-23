function open_nav() {
    var nav = document.getElementById("open-close-nav");
    let navId = nav.id;
    console.log(`id of NAV: ${navId}`);
    console.log(`classes: ${nav.classList}`);
    //.dontShowOnSmall
    if (nav.classList.contains("dontShowOnSmall")){

        nav.classList.remove("dontShowOnSmall");
        //nav.classList.add("dontShowOnSmall");
    } else {
        nav.classList.add("dontShowOnSmall");
        //nav.classList.add("dontShowOnSmall");
    }
}