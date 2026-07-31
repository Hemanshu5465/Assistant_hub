const API_BASE = "http://127.0.0.1:5000/api/admin";

// Auth Check
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
    alert("Access Denied");
    window.location.href = "../forms/login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    loadForms();
});

// --- TABS ---
function showTab(tab) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[onclick="showTab('${tab}')"]`).classList.add('active');

    if (tab === 'users') {
        document.getElementById('usersTab').classList.remove('hidden');
        document.getElementById('formsTab').classList.add('hidden');
        document.getElementById('pageTitle').innerText = "User Management";
    } else {
        document.getElementById('usersTab').classList.add('hidden');
        document.getElementById('formsTab').classList.remove('hidden');
        document.getElementById('pageTitle').innerText = "Form Entries Management";
    }
}

// --- USERS ---
async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();
        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = "";

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user._id.substring(0, 8)}...</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-action btn-delete" onclick="deleteUser('${user._id}')">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) { console.error(err); }
}

async function deleteUser(id) {
    if (!confirm("Are you sure?")) return;
    await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
    loadUsers();
}

// --- FORMS ---
async function loadForms() {
    try {
        const res = await fetch(`${API_BASE}/forms`);
        const forms = await res.json();
        const tbody = document.getElementById("formTableBody");
        tbody.innerHTML = "";

        forms.forEach(form => {
            const row = `
                <tr>
                    <td>${form.company}</td>
                    <td>${form.email}</td>
                    <td>${form.phone}</td>
                    <td>${form.assistant}</td>
                    <td>
                        <button class="btn-action btn-delete" onclick="deleteForm('${form._id}')">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) { console.error(err); }
}

async function deleteForm(id) {
    if (!confirm("Are you sure?")) return;
    await fetch(`${API_BASE}/forms/${id}`, { method: "DELETE" });
    loadForms();
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "../index.html";
}
