const dbUrl = 'http://localhost:3000';
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
function logout() {
    localStorage.removeItem('currentuser');
    window.location.href = '../login.html';
}

function loadProfile() {
    const user = getCurrentUser();
    if (!user) { window.location.href = '../login.html'; return; }
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone;
    document.getElementById("em").innerHTML = user.email;
}

// In Udash.js
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('User_Dashboard.html')) {
        loadAvailableEvents();
    }
    if (window.location.pathname.includes('profile.html')) {
        loadProfile();
    }
    if (window.location.pathname.includes('myevents.html')) {
        loadUserRegistrations();
    }
});