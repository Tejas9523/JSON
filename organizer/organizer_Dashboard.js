const dbUrl = 'http://localhost:3000';

// User session helpers
function setCurrentUser(user) { localStorage.setItem('currentuser', JSON.stringify(user)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
function logout() { localStorage.removeItem('currentuser'); window.location.href = '../login.html'; }

const user = getCurrentUser();
document.getElementById("em").innerHTML = user.email;

// Load profile info
function loadProfile() {
    const user = getCurrentUser();
    if (!user) return window.location.href = '../login.html';
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone;
}

loadProfile();

document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll('#sidebarMenu .nav-link');
    var currentUrl = window.location.pathname.split("/").pop();
    links.forEach(function (link) {
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }
    });
});
