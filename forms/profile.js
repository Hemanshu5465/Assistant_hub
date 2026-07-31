const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser) {
        window.location.href = "login.html";
        return;
    }

    await loadProfileData(localUser.id);
});

async function loadProfileData(userId) {
    try {
        const userRes = await fetch(`${API_BASE}/user/${userId}`);
        if (!userRes.ok) throw new Error("Failed to fetch user");

        const user = await userRes.json();

        // Update Display UI
        document.getElementById("userNameDisplay").innerText = user.name;
        document.getElementById("userEmailDisplay").innerText = user.email;

        // Populate Form
        document.getElementById("editName").value = user.name;
        document.getElementById("editEmail").value = user.email;

        if (user.createdAt) {
            const date = new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            document.getElementById("userJoined").innerText = `Joined ${date}`;
        }

        const avatarDisplay = document.getElementById("avatarDisplay");
        const initials = document.getElementById("initials");

        if (user.profileImage) {
            avatarDisplay.innerHTML = `<img src="http://127.0.0.1:5000${user.profileImage}" alt="Avatar">`;
        } else {
            initials.innerText = user.name.charAt(0).toUpperCase();
        }

        loadStats(user._id);
    } catch (err) {
        console.error("Error loading profile:", err);
    }
}

// Tab Switching
window.switchTab = (tabId) => {
    // Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(tabId));
    });
    // Content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
};

// Handle Profile Update
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const localUser = JSON.parse(localStorage.getItem("user"));
    const name = document.getElementById("editName").value;
    const email = document.getElementById("editEmail").value;

    try {
        const res = await fetch(`${API_BASE}/user/${localUser.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        });

        const data = await res.json();
        if (res.ok) {
            showToast("Profile updated successfully!", "success");
            // Update local storage name if needed
            localUser.name = name;
            localStorage.setItem("user", JSON.stringify(localUser));
            loadProfileData(localUser.id);
            switchTab('overview');
        } else {
            showToast(data.message || "Update failed", "error");
        }
    } catch (err) {
        console.error(err);
        showToast("Error saving changes", "error");
    }
});

// Avatar Upload
document.getElementById("fileInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    const localUser = JSON.parse(localStorage.getItem("user"));
    formData.append("userId", localUser.id);

    try {
        const res = await fetch(`${API_BASE}/user/avatar`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (res.ok) {
            showToast("Avatar updated!", "success");
            document.getElementById("avatarDisplay").innerHTML =
                `<img src="http://127.0.0.1:5000${data.imageUrl}" alt="Avatar">`;
        }
    } catch (err) { console.error(err); }
});

// Password Reset Request
window.requestPasswordReset = async () => {
    const localUser = JSON.parse(localStorage.getItem("user"));

    // We'll use alert for confirm for now as it's a browser standard, 
    // but the final feedback will be a toast.
    if (!confirm("Send a password reset link to your email?")) return;

    try {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: document.getElementById("editEmail").value })
        });

        if (res.ok) {
            showToast("Reset link sent to your email!", "success");
        } else {
            showToast("Failed to send link. Please try again.", "error");
        }
    } catch (err) { console.error(err); }
};

// Stats Loading... (same as before)
async function loadStats(userId) {
    try {
        const res = await fetch(`${API_BASE}/auth/${userId}/usage`);
        const data = await res.json();
        const grid = document.getElementById("statsGrid");
        const usage = data.usage;

        if (!usage || Object.keys(usage).length === 0) {
            grid.innerHTML = "<p style='color:#94a3b8; grid-column: 1/-1; text-align: center;'>No stats available yet.</p>";
            return;
        }

        grid.innerHTML = "";
        Object.entries(usage).forEach(([assistant, count], index) => {
            const icon = getAssistantIcon(assistant);
            const delay = 0.2 + (index * 0.1);
            grid.innerHTML += `
                <div class="stat-card" style="animation-delay: ${delay}s; opacity: 1;">
                    <span class="stat-icon">${icon}</span>
                    <span class="stat-number">${count}</span>
                    <span class="stat-label">${assistant}</span>
                </div>
            `;
        });
    } catch (err) { console.error(err); }
}

function getAssistantIcon(name) {
    if (name.includes("Gym")) return "🏋️";
    if (name.includes("Study")) return "📚";
    if (name.includes("Coding")) return "💻";
    if (name.includes("Mental")) return "🧠";
    if (name.includes("Career")) return "💼";
    if (name.includes("Business")) return "📊";
    if (name.includes("Finance")) return "💰";
    if (name.includes("Travel")) return "✈️";
    if (name.includes("Health")) return "🩺";
    return "🤖";
}
