function toggleReadyButton(button, ready) {
  if (ready == true) {
    button.setAttribute("value", true);
    button.innerHTML = "Ready";
  } else if (ready == false) {
    button.setAttribute("value", false);
    button.innerHTML = "Not Ready";
  } else {
  if (button == playerReadiness[playerIndex]) {
    
    if (button.getAttribute("value") === "false") {
      button.setAttribute("value", true);
      button.innerHTML = "Ready";
      socket.emit("changeReadiness",true)
    } else {
      button.setAttribute("value", false);
      button.innerHTML = "Not Ready";
      socket.emit("changeReadiness",false)
    }

  }
}
}
