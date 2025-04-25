// User session helpers
function setCurrentUser(user) { localStorage.setItem('currentuser', JSON.stringify(user)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
function logout() { localStorage.removeItem('currentuser'); window.location.href = '../login.html'; }

const user = getCurrentUser();
document.getElementById("em").innerHTML = user.email;

const dbUrl = 'http://localhost:3000';
// User session helpers
function setCurrentUser(user) { localStorage.setItem('currentuser', JSON.stringify(user)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
// Load organizer's events
async function loadOrganizerEvents() {
    const organizer = getCurrentUser();
    const events = await (await fetch(`${dbUrl}/events?organizerEmail=${organizer.email}`)).json();
    const bookings = await (await fetch(`${dbUrl}/booking`)).json();
    const container = document.getElementById('organizerEvents');
    container.innerHTML = events.length ? '' : '<div class="alert alert-info">No events found.</div>';
    if (events.length) {
        container.innerHTML = `
<table class="table table-striped">
  <thead>
    <tr>
      <th>Title</th>
      <th>Date</th>
      <th>Location</th>
      <th>Capacity</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    ${events.map(ev => {
            const count = bookings.filter(b => b.eventId === ev.id).length;
            return `
          <tr>
            <td>${ev.title}</td>
            <td>${new Date(ev.datetime).toLocaleString()}</td>
            <td>${ev.location}</td>
            <td>${count}/${ev.capacity || '∞'}</td>
            <td>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-warning" onclick="editEvent('${ev.id}')"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteEvent('${ev.id}')"><i class="bi bi-trash"></i></button>
                <button class="btn btn-sm btn-primary" onclick="showRegistrations('${ev.id}', '${ev.title.replace(/'/g, "\\'")}')"><i class="bi bi-people"></i></button>
              </div>
            </td>
          </tr>
        `;
        }).join('')}
  </tbody>
</table>
`;
    }
}
// Edit event popup
function openEditPopup() {
    document.getElementById('editPopupOverlay').style.display = 'flex';
}
function closeEditPopup() {
    document.getElementById('editPopupOverlay').style.display = 'none';
}
async function editEvent(eventId) {
    const response = await fetch(`${dbUrl}/events/${eventId}`);
    const event = await response.json();

    document.getElementById('editEventId').value = event.id;
    document.getElementById('editTitle').value = event.title;
    document.getElementById('editDatetime').value = new Date(event.datetime).toISOString().slice(0, 16);
    document.getElementById('editLocation').value = event.location;
    document.getElementById('editCapacity').value = event.capacity || '';

    openEditPopup();
}
async function updateEvent(e) {
    e.preventDefault();
    const id = document.getElementById('editEventId').value;
    const updatedEvent = {
        title: document.getElementById('editTitle').value,
        datetime: new Date(document.getElementById('editDatetime').value).toISOString(),
        location: document.getElementById('editLocation').value,
        capacity: parseInt(document.getElementById('editCapacity').value) || null,
    };
    const res = await fetch(`${dbUrl}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
    });
    if (res.ok) {
        closeEditPopup();
        await loadOrganizerEvents();
    } else {
        alert('Failed to update event.');
    }
    return false;
}
// Delete event and related bookings
async function deleteEvent(eventId) {
    if (confirm('Are you sure?')) {
        await fetch(`${dbUrl}/events/${eventId}`, { method: 'DELETE' });
        const bks = await (await fetch(`${dbUrl}/booking?eventId=${eventId}`)).json();
        for (const b of bks) await fetch(`${dbUrl}/booking/${b.id}`, { method: 'DELETE' });
        loadOrganizerEvents();
        renderCharts();
    }
}
// Show registrations modal
async function showRegistrations(eventId, eventTitle) {
    modalEventTitle.textContent = eventTitle;
    const bookings = await (await fetch(`${dbUrl}/booking?eventId=${eventId}`)).json();
    const users = await (await fetch(`${dbUrl}/registration`)).json();
    let tableHTML = `<table class="table table-striped">
<thead>
<tr>
<th><i class="bi bi-person"></i> Name</th>
<th>Email</th>
<th>Phone</th>
<th>Action</th>
</tr>
</thead>
<tbody>
`;
    bookings.forEach(b => {
        const user = users.find(u => u.id === b.userId);
        if (user) {
            tableHTML += `
<tr>
  <td>${user.name}</td>
  <td>${user.email}</td>
  <td>${user.phone}</td>
  <td>
    <button class="btn btn-danger btn-sm dltuser" data-userid="${user.id}" data-eventid="${eventId}">
    <i class="bi bi-trash"></i>
    </button>
  </td>
</tr>
`;
        }
    });
    tableHTML += `</tbody></table>`;
    modalUserList.innerHTML = tableHTML;
    modalRegCount.textContent = bookings.length;
    new bootstrap.Modal(document.getElementById('registrationsModal')).show();
}

// Delete user registration from event (delegated)
document.addEventListener('click', async function (e) {
    if (e.target.closest('.dltuser')) {
        const btn = e.target.closest('.dltuser');
        const userId = btn.getAttribute('data-userid');
        const eventId = btn.getAttribute('data-eventid');
        if (confirm('Remove this user from the event?')) {
            const bookings = await (await fetch(`${dbUrl}/booking?eventId=${eventId}&userId=${userId}`)).json();
            for (const b of bookings) {
                await fetch(`${dbUrl}/booking/${b.id}`, { method: 'DELETE' });
            }
            showRegistrations(eventId, document.getElementById('modalEventTitle').textContent);
        }
    }
});

loadOrganizerEvents();

document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll('#sidebarMenu .nav-link');
    var currentUrl = window.location.pathname.split("/").pop();
    links.forEach(function (link) {
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }
    });
});