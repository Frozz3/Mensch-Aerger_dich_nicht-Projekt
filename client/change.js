function toggleText(button, ready) {
  if (ready == true) {
    button.setAttribute("value", false);
    button.innerHTML = "Ready";
  } else if (ready == false) {
    button.setAttribute("value", true);
    button.innerHTML = "Not Ready";
  } else
    if (button.getAttribute("value") === "false") {
      button.setAttribute("value", true);
      button.innerHTML = "Not Ready";
    } else {
      button.setAttribute("value", false);
      button.innerHTML = "Ready";
    }
}

