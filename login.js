// script.js

const dbUrl = 'http://localhost:3000'; // Adjust if using JSON-server

// Helper: Save current user to localStorage
function setCurrentUser(user) {
    localStorage.setItem('currentuser', JSON.stringify(user));
}

// Helper: Get current user from localStorage
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentuser'));
}


// Login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').onsubmit = async function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const res = await fetch(`${dbUrl}/registration?email=${email}&password=${password}`);
        const users = await res.json();
        if (users.length === 1) {
            setCurrentUser(users[0]);
            window.location.href = users[0].usertype === 'organizer' ? 'organizer/organizer_Dashboard.html' : 'user/User_Dashboard.html';
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    };
}