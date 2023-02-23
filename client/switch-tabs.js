function switchTab() {
    let tabswitch = document.getElementsByClassName("tab-header")[0].getElementsByTagName("div");
  
    for(let i=0; i<tabswitch.length; i++) {
      tabswitch[i].addEventListener("click", function() {
        let activeTabHeader = document.getElementsByClassName("tab-header")[0].getElementsByClassName("active")[0];
        activeTabHeader.classList.remove("active");
        tabswitch[i].classList.add("active");
  
        let activeTabContent = document.getElementsByClassName("tab-content")[0].getElementsByClassName("active")[0];
        activeTabContent.classList.remove("active");
  
        let tabBody = document.getElementsByClassName("tab-content")[0].getElementsByClassName("tab-body")[i];
        tabBody.classList.add("active");
      });
    }
  }