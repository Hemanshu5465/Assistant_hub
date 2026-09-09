/*const assistantSection = document.getElementById("assistant-section");
const chatSection = document.getElementById("chat-section");
const assistantName = document.getElementById("assistantName");
const chatBox = document.getElementById("chatBox");

function openChat(name) {
    assistantSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    assistantName.innerText = name;
}

function goBack() {
    chatSection.classList.add("hidden");
    assistantSection.classList.remove("hidden");
    chatBox.innerHTML = `<div class="bot-msg">Hello! How can I help you today? 😊</div>`;
}

function sendMessage() {
    const input = document.getElementById("userInput");
    if (input.value.trim() === "") return;

    const userMsg = document.createElement("div");
    userMsg.className = "user-msg";
    userMsg.innerText = input.value;

    chatBox.appendChild(userMsg);
    input.value = "";

    chatBox.scrollTop = chatBox.scrollHeight;
}
    */

function openChat(name) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    showAuthModal();
    return;
  }
  window.location.href = `chat.html?assistant=${encodeURIComponent(name)}`;
}

function showAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("active");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("active");
}

// Dropdown Toggle
function toggleDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("active");

  // Close when clicking outside
  document.addEventListener("click", function closeDropdown(e) {
    if (!e.target.closest("#userProfile")) {
      dropdown.classList.remove("active");
      document.removeEventListener("click", closeDropdown);
    }
  });
}

// Auth Logic
document.addEventListener("DOMContentLoaded", async () => {
  const localUser = JSON.parse(localStorage.getItem("user"));
  const loginBtn = document.getElementById("loginBtn");
  const userProfile = document.getElementById("userProfile");

  if (localUser) {
    if (loginBtn) loginBtn.style.display = "none";
    if (userProfile) {
      userProfile.style.display = "flex";
      userProfile.classList.remove("hidden");

      const navName = document.getElementById("navUserName");
      const dropName = document.getElementById("dropdownName");
      const dropEmail = document.getElementById("dropdownEmail");
      const initials = document.getElementById("userInitials");

      // Set initial data from local storage
      if (navName) navName.innerText = localUser.name.split(' ')[0];
      if (dropName) dropName.innerText = localUser.name;

      try {
        const res = await fetch(`${window.API_BASE}/api/user/${localUser.id}`);
        if (res.ok) {
          const user = await res.json();

          if (navName) navName.innerText = user.name.split(' ')[0];
          if (dropName) dropName.innerText = user.name;
          if (dropEmail) dropEmail.innerText = user.email;

          if (user.profileImage) {
            initials.innerHTML = `<img src="${window.API_BASE}${user.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            initials.style.background = "transparent";
          } else {
            initials.innerText = user.name.charAt(0).toUpperCase();
          }
        }
      } catch (e) {
        console.error("Failed to sync profile:", e);
        if (initials) initials.innerText = localUser.name.charAt(0).toUpperCase();
      }
    }
  }
});

function logout() {
  localStorage.removeItem("user");
  window.location.reload();
}

// FLYING ARROW CURSOR LOGIC
const arrow = document.createElement("div");
arrow.id = "flying-arrow";
document.body.appendChild(arrow);

let mouseX = 0, mouseY = 0;
let arrowX = 0, arrowY = 0;
let arrowSpeed = 0.15; // Smoothness factor

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  arrow.style.display = "block";
});

function animateArrow() {
  // Lerp position
  arrowX += (mouseX - arrowX) * arrowSpeed;
  arrowY += (mouseY - arrowY) * arrowSpeed;

  // Calculate angle
  const dx = mouseX - arrowX;
  const dy = mouseY - arrowY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Only rotate if moving significantly
  if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
    arrow.style.transform = `translate(${arrowX}px, ${arrowY}px) rotate(${angle}deg)`;
  } else {
    arrow.style.transform = `translate(${arrowX}px, ${arrowY}px)`;
  }

  requestAnimationFrame(animateArrow);
}

// Start Animation
animateArrow();

// ===== SCROLL REVEAL LOGIC =====
document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // Optional: Unobserve after revealing
        // revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: "0px 0px -50px 0px" // Slight offset for better feel
  });

  revealElements.forEach(el => revealObserver.observe(el));
});




