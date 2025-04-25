const dbUrl = 'http://localhost:3000';
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
function logout() {
    localStorage.removeItem('currentuser');
    window.location.href = '../login.html';
}

// --- loadAvailableEvents and registerEvent with the below ---
async function loadAvailableEvents() {
    const user = getCurrentUser();
    const currentDate = new Date();
    // Fetch all events and all bookings
    const [eventsRes, bookingsRes] = await Promise.all([
        fetch(`${dbUrl}/events`),
        fetch(`${dbUrl}/booking`)
    ]);
    const [events, allBookings] = await Promise.all([eventsRes.json(), bookingsRes.json()]);
    // User's bookings
    const userBookings = allBookings.filter(b => b.userId === user.id);
    const registeredEventIds = userBookings.map(b => b.eventId);

    // Split events into upcoming and past
    const upcomingEvents = [];
    const pastEvents = [];
    events.forEach(ev => {
        const eventDate = new Date(ev.datetime);
        if (eventDate > currentDate) {
            upcomingEvents.push(ev);
        } else {
            pastEvents.push(ev);
        }
    });

    // Helper: count current registrations for an event
    function getRegisteredCount(eventId) {
        return allBookings.filter(b => b.eventId === eventId).length;
    }

    // Helper: create event card with capacity and button logic
    const createEventCard = (ev, isPast) => {
        const alreadyRegistered = registeredEventIds.includes(ev.id);
        const registeredCount = getRegisteredCount(ev.id);
        const isFull = registeredCount >= ev.capacity;

        return `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h6 class="card-title mb-2">${ev.title}</h6>
              <p class="mb-1"><i class="bi bi-calendar-event"></i> 
                <strong>Date:</strong> ${new Date(ev.datetime).toLocaleString()}
              </p>
              <p class="mb-1"><i class="bi bi-geo-alt"></i> 
                <strong>Location:</strong> ${ev.location}
              </p>
              <p class="mb-2"><i class="bi bi-info-circle"></i> 
                <strong>Description:</strong> ${ev.description}
              </p>
              <p class="mb-2"><i class="bi bi-people"></i>
                <strong>Capacity:</strong> ${registeredCount} / ${ev.capacity}
              </p>
              <button class="btn btn-sm w-100 
                ${alreadyRegistered ? 'btn-success' : 'btn-primary'}" 
                ${(alreadyRegistered || isPast || isFull) ? 'disabled' : ''}
                onclick="registerEvent('${ev.id}')">
                ${alreadyRegistered ?
                '<i class="bi bi-check-circle"></i> Registered' :
                (isPast ? '<i class="bi bi-clock-history"></i> Event Ended' :
                    (isFull ? '<i class="bi bi-exclamation-circle"></i> Full' :
                        '<i class="bi bi-plus-circle"></i> Register'))}
              </button>
            </div>
          </div>
        </div>
      `;
    };

    // Update DOM
    const upcomingDiv = document.getElementById('upcomingEvents');
    const pastDiv = document.getElementById('pastEvents');
    upcomingDiv.innerHTML = upcomingEvents.length ?
        upcomingEvents.map(ev => createEventCard(ev, false)).join('') :
        '<div class="alert alert-info">No upcoming events found.</div>';

    pastDiv.innerHTML = pastEvents.length ?
        pastEvents.map(ev => createEventCard(ev, true)).join('') :
        '<div class="alert alert-secondary">No past events found.</div>';

    document.getElementById("em").innerHTML = user.email;

}


// Restrict registration if capacity is full
async function registerEvent(eventId) {
    const user = getCurrentUser();
    // Fetch event and current bookings for this event
    const [eventRes, bookingsRes] = await Promise.all([
        fetch(`${dbUrl}/events/${eventId}`),
        fetch(`${dbUrl}/booking?eventId=${eventId}`)
    ]);
    const ev = await eventRes.json();
    const bookings = await bookingsRes.json();

    if (bookings.length >= ev.capacity) {
        alert('Registration failed: Event is already full.');
        return;
    }

    await fetch(`${dbUrl}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, eventId })
    });
    loadAvailableEvents();
    loadUserRegistrations();
    document.getElementById('myRegistrationsBtn').click();
}


// Expose functions globally
window.registerEvent = registerEvent;
window.logout = logout;

document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll('#sidebarMenu .nav-link');
    var currentUrl = window.location.pathname.split("/").pop();
    links.forEach(function (link) {
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }
    });
});

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