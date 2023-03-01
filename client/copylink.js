function copy() {

  let copyText = document.getElementById("roomLink");
  copyText.select();

  navigator.clipboard.writeText(copyText.value);
  
}