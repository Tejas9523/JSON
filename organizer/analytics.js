const dbUrl = 'http://localhost:3000';

// User session helpers
function setCurrentUser(user) { localStorage.setItem('currentuser', JSON.stringify(user)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentuser')); }
function logout() { localStorage.removeItem('currentuser'); window.location.href = '../login.html'; }

const user = getCurrentUser();
document.getElementById("em").innerHTML = user.email;

// Charts
async function renderCharts() {

    const organizer = getCurrentUser();
    const events = await (await fetch(`${dbUrl}/events?organizerEmail=${organizer.email}`)).json();
    const bookings = await (await fetch(`${dbUrl}/booking`)).json();

    // Attendees per Event
    const attendees = events.map(ev => ({
        title: ev.title,
        count: bookings.filter(b => b.eventId === ev.id).length,
        capacity: ev.capacity || 0
    }));

    new Chart(document.getElementById('attendeesChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: attendees.map(e => e.title),
            datasets: [
                { label: 'Attendees', data: attendees.map(e => e.count), backgroundColor: 'rgba(54, 162, 235, 0.6)' },
                { label: 'Capacity', data: attendees.map(e => e.capacity), backgroundColor: 'rgba(255, 99, 132, 0.4)' }
            ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, precision: 0 } }
        }
    });

    // Registrations Over Time (last 5 days)
    const currentDate = new Date();
    const days = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentDate);
        d.setDate(currentDate.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    const dateMap = {};
    bookings.forEach(b => {
        const d = new Date(b.timestamp || b.date || Date.now()).toISOString().split('T')[0];
        dateMap[d] = (dateMap[d] || 0) + 1;
    });
    const labels = days;
    const data = days.map(d => dateMap[d] || 0);

    new Chart(document.getElementById('registrationsChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Registrations',
                data: data,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, precision: 0 } }
        }
    });
}
renderCharts();

document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll('#sidebarMenu .nav-link');
    var currentUrl = window.location.pathname.split("/").pop();
    links.forEach(function (link) {
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }
    });
});