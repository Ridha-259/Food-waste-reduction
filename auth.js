// Simulated user database (in real app, use backend server)
let users = JSON.parse(localStorage.getItem('users')) || {};

function showForm(formType) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    
    document.querySelector(`button[onclick="showForm('${formType}')"]`).classList.add('active');
    document.getElementById(`${formType}Form`).classList.remove('hidden');
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (users[email] && users[email] === password) {
        localStorage.setItem('currentUser', email);
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('loginError').textContent = 'Invalid email or password';
    }
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (users[email]) {
        document.getElementById('signupError').textContent = 'Email already exists';
        return;
    }
    
    users[email] = password;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', email);
    window.location.href = 'dashboard.html';
}); 