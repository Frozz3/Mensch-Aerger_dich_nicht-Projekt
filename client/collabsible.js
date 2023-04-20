
function collabsible() {
let toggleCollapsible = document.getElementById("toggleColl");
toggleCollapsible.addEventListener("click", () => {

    let div1 = document.getElementsByClassName("content-player")[0];
    let div2 = document.getElementsByClassName("content-buttons")[0];



    if (div1.classList.contains("visible")) {

        div1.classList.remove("visible");
        div2.classList.remove("visible");
    } else {

        div1.classList.add("visible");
        div2.classList.add("visible");
    }
});}