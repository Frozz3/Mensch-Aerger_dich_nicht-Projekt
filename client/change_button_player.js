function toggleReadyButton(button) {
  if (button == playerReadiness[playerIndex]) {
    
    if (button.getAttribute("value") === "false") {
      socket.emit("changeReadiness",true)
    } else {
      socket.emit("changeReadiness",false)
    }

  }
}
