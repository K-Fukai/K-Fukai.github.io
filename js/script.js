// Function to open the sidenav
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    // Add an event listener to the document to close the sidenav when the user clicks outside of it
    document.addEventListener('click', closeNavOnOutsideClick);
  }
  
  // Function to close the sidenav
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    // Remove the event listener from the document when the sidenav is closed
    document.removeEventListener('click', closeNavOnOutsideClick);
  }
  
  // Function to handle closing the sidenav on outside click
  function closeNavOnOutsideClick(event) {
    const sidenav = document.getElementById("mySidenav");
    const menuIcon = document.getElementById("menu-icon");
  
    // If the clicked target is not the sidenav and not the menu icon, close the sidenav
    if (!sidenav.contains(event.target) && !menuIcon.contains(event.target)) {
      closeNav();
    }
  }
  

  function toggleNav() {
    const sidenav = document.getElementById("mySidenav");
    if (sidenav.style.width === "0px" || !sidenav.style.width) {
      openNav();
    } else {
      closeNav();
    }
  }


function navigateWithDelay(e) {
    e.preventDefault(); // Prevent immediate navigation
    const href = e.target.href; // Store the target URL
    
    closeNav(); // Close the sidenav
    
    // Navigate to the target URL after a delay
    setTimeout(() => {
        window.location.href = href;
    }, 300); // Assume the closing animation takes 300ms. Adjust as needed.
}
