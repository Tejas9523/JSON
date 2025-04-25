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

// Registration
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').onsubmit = async function (e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const phone = document.getElementById('regPhone').value;
        const usertype = document.getElementById('regUserType').value;
        if (!name || !email || !password || !phone || !usertype) {
            document.getElementById('regError').innerText = "All fields required";
            document.getElementById('regError').style.display = 'block';
            return;
        }
        const res = await fetch(`${dbUrl}/registration?email=${email}`);
        const exists = await res.json();
        if (exists.length > 0) {
            document.getElementById('regError').innerText = "Email already registered";
            document.getElementById('regError').style.display = 'block';
            return;
        }
        await fetch(`${dbUrl}/registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone, usertype })
        });
        window.location.href = 'login.html';
    };
}

document.getElementById('registerForm').addEventListener('submit', function (e) {
    const form = e.target;
    e.preventDefault();
    e.stopPropagation();

    // Clear previous validation states
    form.classList.remove('was-validated');
    const inputs = form.querySelectorAll('.form-control, .form-select, .form-check-input');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.innerText = '';
        }
    });

    let isValid = true;

    // Name validation
    const nameInput = document.getElementById('regName');
    if (nameInput.value.trim() === '') {
        showError(nameInput, "Please enter your full name.");
        isValid = false;
    }

    // Email validation
    const emailInput = document.getElementById('regEmail');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailInput.value.trim())) {
        showError(emailInput, "Please enter a valid email.");
        isValid = false;
    }

    // Password validation
    const passwordInput = document.getElementById('regPassword');
    if (!/(?=.*[A-Za-z])(?=.*\d).{6,}/.test(passwordInput.value)) {
        showError(passwordInput, "Password must be at least 6 characters and contain a letter and a number.");
        isValid = false;
    }

    // Phone validation
    const phoneInput = document.getElementById('regPhone');
    if (!/^\d{10}$/.test(phoneInput.value.trim())) {
        showError(phoneInput, "Enter a 10-digit phone number.");
        isValid = false;
    }

    // User type validation
    const userTypeSelect = document.getElementById('regUserType');
    if (!userTypeSelect.value) {
        showError(userTypeSelect, "Please select your user type.");
        isValid = false;
    }

    // Terms check
    const termsCheck = document.getElementById('termsCheck');
    if (!termsCheck.checked) {
        showError(termsCheck, "You must agree before registering.");
        isValid = false;
    }

    if (isValid) {
        alert("Registration successful! You can now sign in.");
        window.location.href = "login.html";
    } else {
        form.classList.add('was-validated');
    }
});

function showError(inputElement, message) {
    inputElement.classList.add('is-invalid');
    const feedback = inputElement.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.innerText = message;
    }
}