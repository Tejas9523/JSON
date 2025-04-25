const dbUrl = 'http://localhost:3000';

// User session helpers
function setCurrentUser(user) { localStorage.setItem('currentuser', JSON.stringify(user)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
function logout() { localStorage.removeItem('currentuser'); window.location.href = '../login.html'; }

const user = getCurrentUser();
document.getElementById("em").innerHTML = user.email;

// Event creation
document.getElementById('createEventForm').onsubmit = async function (e) {
    e.preventDefault();
    const title = eventTitle.value.trim();
    const datetime = eventDatetime.value;
    const location = eventLocation.value.trim();
    const capacity = parseInt(eventCapacity.value.trim());
    const description = eventDescription.value.trim();
    const organizer = getCurrentUser();

    if (!title || !datetime || !location || !description || isNaN(capacity) || capacity < 1) {
        showError('eventError', "All fields including capacity are required.");
        return;
    }
    if (new Date(datetime) < new Date()) {
        showError('eventError', "Date & Time must be in the future.");
        return;
    }
    const existing = await (await fetch(`${dbUrl}/events?organizerEmail=${organizer.email}&title=${encodeURIComponent(title)}&datetime=${datetime}`)).json();
    if (existing.length > 0) return showError('eventError', "Event already exists.");

    try {
        await fetch(`${dbUrl}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, datetime, location, description, capacity, organizerName: organizer.name, organizerEmail: organizer.email })
        });
        this.reset();
        showSuccess('eventSuccess');
        loadOrganizerEvents();
        document.querySelector('[data-section="myEventsSection"]').click();
    } catch {
        showError('eventError', "Event creation failed.");
    }
};

function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.remove('d-none');
    setTimeout(() => el.classList.add('d-none'), 2200);
}
function showSuccess(id) {
    const el = document.getElementById(id);
    el.classList.remove('d-none');
    setTimeout(() => el.classList.add('d-none'), 2000);
}

document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll('#sidebarMenu .nav-link');
    var currentUrl = window.location.pathname.split("/").pop();
    links.forEach(function (link) {
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }
    });
});