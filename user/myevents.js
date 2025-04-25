const dbUrl = 'http://localhost:3000';
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
function logout() {
    localStorage.removeItem('currentuser');
    window.location.href = '../login.html';
}

async function loadUserRegistrations() {
    const user = getCurrentUser();
    const bookingsRes = await fetch(`${dbUrl}/booking?userId=${user.id}`);
    const bookings = await bookingsRes.json();
    const eventsRes = await fetch(`${dbUrl}/events`);
    const events = await eventsRes.json();
    const userRegistrationsDiv = document.getElementById('userRegistrations');
    userRegistrationsDiv.innerHTML = '';
    if (bookings.length === 0) {
        userRegistrationsDiv.innerHTML = '<div class="alert alert-info">You haven\'t registered for any events yet.</div>';
        return;
    }
    bookings.forEach(b => {
        const ev = events.find(e => e.id === b.eventId);
        if (ev) {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="card h-100 shadow-sm border-0">
                  <div class="card-body">
                    <h6 class="card-title mb-2">${ev.title}</h6>
                    <p class="mb-1"><i class="bi bi-calendar-event"></i> <strong>Date:</strong> ${new Date(ev.datetime).toLocaleString()}</p>
                    <p class="mb-1"><i class="bi bi-geo-alt"></i> <strong>Location:</strong> ${ev.location}</p>
                    <p class="mb-2"><i class="bi bi-info-circle"></i> <strong>Description:</strong> ${ev.description}</p>
                    <span class="badge bg-success w-100 py-2"><i class="bi bi-check-circle"></i> Registered</span>
                  </div>
                </div>
              `;
            userRegistrationsDiv.appendChild(col);
        }
    });
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
