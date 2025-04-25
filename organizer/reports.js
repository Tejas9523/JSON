const dbUrl = 'http://localhost:3000';

// User session helpers
function setCurrentUser(user) { localStorage.setItem('currentuser', JSON.stringify(user)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
function logout() { localStorage.removeItem('currentuser'); window.location.href = 'login.html'; }

const user = getCurrentUser();
document.getElementById("em").innerHTML = user.email;

// Download report as CSV
document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('downloadReportBtn');
    if (btn) {
        btn.addEventListener('click', downloadEventwiseReportCSV);
    }
});

async function downloadEventwiseReportCSV() {
    const organizer = getCurrentUser();
    if (!organizer) return;
    const events = await (await fetch(`${dbUrl}/events?organizerEmail=${organizer.email}`)).json();
    const bookings = await (await fetch(`${dbUrl}/booking`)).json();
    const users = await (await fetch(`${dbUrl}/registration`)).json();
    let csv = 'Event Title,Event Date,User Name,User Email,User Phone\n';
    events.forEach(ev => {
        const eventBookings = bookings.filter(b => b.eventId === ev.id);
        eventBookings.forEach(b => {
            const user = users.find(u => u.id === b.userId);
            if (user) {
                csv += `"${ev.title}","${new Date(ev.datetime).toLocaleString()}","${user.name}","${user.email}","${user.phone}"\n`;
            }
        });
        if (eventBookings.length === 0) {
            csv += `"${ev.title}","${new Date(ev.datetime).toLocaleString()}","No registrations","",""\n`;
        }
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eventwise_registrations_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Report section: event-wise user list
async function loadEventwiseUserList() {
    const organizer = getCurrentUser();
    if (!organizer) return;
    const events = await (await fetch(`${dbUrl}/events?organizerEmail=${organizer.email}`)).json();
    const bookings = await (await fetch(`${dbUrl}/booking`)).json();
    const users = await (await fetch(`${dbUrl}/registration`)).json();
    const container = document.getElementById('eventwiseUserList');
    if (!events.length) {
        container.innerHTML = '<div class="alert alert-info">No events found.</div>';
        return;
    }
    let html = '';
    events.forEach(ev => {
        const eventBookings = bookings.filter(b => b.eventId === ev.id);
        html += `
      <h5 class="mt-4">${ev.title} <small class="text-muted">(${eventBookings.length}/${ev.capacity || '∞'})</small></h5>
      <table class="table table-bordered table-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          ${eventBookings.map(b => {
            const user = users.find(u => u.id === b.userId);
            return user ? `
              <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
              </tr>
            ` : '';
        }).join('')}
        </tbody>
      </table>
    `;
        if (!eventBookings.length) {
            html += `<div class="text-muted mb-3">No registrations yet.</div>`;
        }
    });
    container.innerHTML = html;
}

// Report section: daily registration summary
async function loadDailyRegistrationSummary() {
    const organizer = getCurrentUser();
    if (!organizer) return;
    const events = await (await fetch(`${dbUrl}/events?organizerEmail=${organizer.email}`)).json();
    const eventIds = events.map(ev => ev.id);
    const bookings = await (await fetch(`${dbUrl}/booking`)).json();
    const filteredBookings = bookings.filter(b => eventIds.includes(b.eventId));
    const summary = {};
    filteredBookings.forEach(b => {
        const dateStr = (b.timestamp || b.date || new Date().toISOString()).slice(0, 10);
        summary[dateStr] = (summary[dateStr] || 0) + 1;
    });
    const sortedDates = Object.keys(summary).sort();
    let html = `<table class="table table-bordered table-sm mb-0">
    <thead><tr><th>Date</th><th>Registrations</th></tr></thead>
    <tbody>
      ${sortedDates.map(date => `
        <tr>
          <td>${date}</td>
          <td>${summary[date]}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
    if (sortedDates.length === 0) {
        html = `<div class="text-muted">No registrations yet.</div>`;
    }
    document.getElementById('dailyRegistrationSummary').innerHTML = "html";
}

// Load reports when Reports tab is clicked
loadDailyRegistrationSummary();
loadEventwiseUserList();

document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll('#sidebarMenu .nav-link');
    var currentUrl = window.location.pathname.split("/").pop();
    links.forEach(function (link) {
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }
    });
});