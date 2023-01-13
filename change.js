function change(className) {
    var buttons = document.getElementsByClassName(className);
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(){
            this.innerHTML = "Neuer Text";
        });
    }
}
changeButtonText("my-button-class");