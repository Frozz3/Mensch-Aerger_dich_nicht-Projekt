let menuOpen = false;
let menuBtn
function burgerMenu() {
  menuBtn = document.querySelector('.menu-btn');
console.log("menuBtn: ");
  console.log(menuBtn);
  menuBtn.addEventListener('click', () => {
    if (!menuOpen) {
      menuBtn.classList.add('open');
      menuOpen = true;
    } else {
      menuBtn.classList.remove('open');
      menuOpen = false;
    }
  });
}