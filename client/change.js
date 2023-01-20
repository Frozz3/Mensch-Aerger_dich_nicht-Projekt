function toggleText(button) {
  if (button.getAttribute("value") === "false") {
      button.setAttribute("value", true);
      button.innerHTML ="Not Ready";
  } else {
      button.setAttribute("value", false);
      button.innerHTML= "Ready";
  }
}

