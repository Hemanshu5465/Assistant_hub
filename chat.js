document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const assistantType = urlParams.get('assistant') || 'General AI';
    let chatId = urlParams.get('chatId');

    // UI Elements
    const assistantNameEl = document.getElementById("assistantName");
    const welcomeTitleEl = document.getElementById("welcomeAssistantTitle");
    const mobileHeaderTitle = document.getElementById("mobileHeaderTitle");
    const messageContainer = document.getElementById("messageContainer");
    const chatForm = document.getElementById("chatForm");
    const messageInput = document.getElementById("messageInput");
    const sidebarIcon = document.getElementById("sidebarIcon");
    const welcomeAvatar = document.getElementById("welcomeAvatar");
    const suggestionsBox = document.getElementById("suggestions");

    // Configuration
    const assistantConfig = {
        "Gym Assistant": { icon: "🏋️", suggestions: ["Push workout plan", "Low carb diet", "How to squat?"] },
        "Study Assistant": { icon: "📚", suggestions: ["Math study tips", "Summary of photosynthesis", "Exam schedule help"] },
        "Coding Assistant": { icon: "💻", suggestions: ["Fix my CSS bug", "Rest API example", "React hooks intro"] },
        "Mental Health Assistant": { icon: "🧠", suggestions: ["Stress relief exercise", "Guided breathing", "Morning motivation"] },
        "Career Assistant": { icon: "💼", suggestions: ["Resume tips", "Interview questions", "Linkedin optimization"] },
        "Business Assistant": { icon: "📊", suggestions: ["Startup idea feedback", "Marketing strategy", "Business plan template"] },
        "Finance Assistant": { icon: "💰", suggestions: ["Budgeting 101", "Stock market basics", "How to save $500/mo?"] },
        "Travel Assistant": { icon: "✈️", suggestions: ["Dubai itinerary", "Best time to visit Bali", "Packing list"] },
        "Health Assistant": { icon: "🩺", suggestions: ["Smoothie recipes", "Better sleep tips", "Hydration guide"] },
        "Productivity Assistant": { icon: "⏱️", suggestions: ["Time blocking tips", "Stop procrastination", "Daily to-do list"] },
        "Language Learning Assistant": { icon: "🌍", suggestions: ["Learn Spanish", "Grammar check", "Common phrases"] },
        "Customer Support Assistant": { icon: "🎧", suggestions: ["Track my order", "Refund policy", "Contact human"] }
    };

    // Initialize UI State
    const config = assistantConfig[assistantType] || { icon: "🤖", suggestions: ["Hello!", "What can you do?"] };

    if (assistantNameEl) assistantNameEl.innerText = assistantType;
    if (welcomeTitleEl) welcomeTitleEl.innerText = assistantType;
    if (mobileHeaderTitle) mobileHeaderTitle.innerText = assistantType;
    const mobileIcon = document.getElementById("mobileIcon");
    if (mobileIcon) mobileIcon.innerText = config.icon;
    if (sidebarIcon) sidebarIcon.innerText = config.icon;
    if (welcomeAvatar) welcomeAvatar.innerText = config.icon;

    // Load Suggestions
    config.suggestions.forEach(text => {
        const pill = document.createElement("button");
        pill.className = "suggestion-pill";
        pill.innerText = text;
        pill.onclick = () => {
            messageInput.value = text;
            chatForm.dispatchEvent(new Event('submit'));
        };
        suggestionsBox.appendChild(pill);
    });

    // File Handling
    const fileInput = document.getElementById("fileInput");
    const attachmentPreview = document.getElementById("attachmentPreview");
    let selectedFiles = [];

    fileInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (selectedFiles.length >= 5) return; // Limit to 5 files
            selectedFiles.push(file);
            renderPreview(file);
        });
        updatePreviewVisibility();
        fileInput.value = ""; // Clear for next selection
    });

    function renderPreview(file) {
        const reader = new FileReader();
        const item = document.createElement("div");
        item.className = "preview-item";

        const removeBtn = document.createElement("button");
        removeBtn.className = "preview-remove";
        removeBtn.innerHTML = "×";
        removeBtn.onclick = () => {
            selectedFiles = selectedFiles.filter(f => f !== file);
            item.remove();
            updatePreviewVisibility();
        };

        if (file.type.startsWith("image/")) {
            reader.onload = (e) => {
                item.innerHTML = `<img src="${e.target.result}" alt="preview">`;
                item.appendChild(removeBtn);
            };
            reader.readAsDataURL(file);
        } else {
            item.innerHTML = `<div class="file-icon">📄</div>`;
            item.appendChild(removeBtn);
        }

        attachmentPreview.appendChild(item);
    }

    function updatePreviewVisibility() {
        attachmentPreview.style.display = selectedFiles.length > 0 ? "flex" : "none";
    }

    // Auto-resize textarea
    messageInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });

    // Handle Enter vs Shift+Enter
    messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // User Auth Detection
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        // Show login requirement message and disable inputs
        messageContainer.innerHTML = `
            <div class="welcome-center">
                <div class="welcome-icon">🔒</div>
                <h1>Login Required</h1>
                <p>You must be logged in to chat with our AI assistants. Please <a href="forms/login.html" style="color: var(--accent); text-decoration: underline;">log in</a> or <a href="forms/register.html" style="color: var(--accent); text-decoration: underline;">create an account</a> to continue.</p>
            </div>
        `;
        messageInput.disabled = true;
        messageInput.placeholder = "Please login to chat...";
        chatForm.querySelector('button[type="submit"]').disabled = true;
        chatForm.querySelector('.attach-btn').disabled = true;

        // Hide sidebar history for guests
        const historyList = document.getElementById("recentChatsList");
        if (historyList) historyList.innerHTML = `<div style="color: var(--text-secondary); font-size: 0.8rem; padding: 10px;">Please login to view history</div>`;
        return; // Stop further execution for guests
    }

    const userId = currentUser ? currentUser.id : "guest";
    const historyKey = `ai_chat_history_${userId}`;

    scrollToBottom();

    // Always create a new chat when no chatId is provided
    let history = JSON.parse(localStorage.getItem(historyKey) || "[]");
    if (!chatId) {
        // Always create a new chat session
        chatId = "chat_" + Date.now();
        const newSession = { id: chatId, name: assistantType, messages: [], lastUpdated: Date.now() };
        history.unshift(newSession);
        localStorage.setItem(historyKey, JSON.stringify(history));
        
        const newUrl = `${window.location.pathname}?assistant=${encodeURIComponent(assistantType)}&chatId=${chatId}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }

    loadHistoryAndMessages();

    // Setup MutationObserver for auto-scrolling
    const observer = new MutationObserver(() => {
        scrollToBottom();
    });
    observer.observe(messageContainer, { childList: true, subtree: true });

    // Handle images loading to scroll again
    messageContainer.addEventListener('load', (e) => {
        if (e.target.tagName === 'IMG') {
            scrollToBottom();
        }
    }, true);

    function loadHistoryAndMessages() {
        const historyList = document.getElementById("recentChatsList");
        const history = JSON.parse(localStorage.getItem(historyKey) || "[]");

        historyList.innerHTML = "";
        if (history.length === 0) {
            historyList.innerHTML = `<div style="color: var(--text-secondary); font-size: 0.8rem; padding: 10px;">No recent chats</div>`;
        } else {
            history.forEach(item => {
                const date = new Date(item.lastUpdated || Date.now());
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

                const entry = document.createElement("a");
                entry.href = `chat.html?assistant=${encodeURIComponent(item.name)}&chatId=${item.id}`;
                entry.className = `history-item ${item.id === chatId ? 'active' : ''}`;
                entry.innerHTML = `
                    <span class="history-item-icon">${assistantConfig[item.name]?.icon || '🤖'}</span>
                    <div style="flex:1; overflow: hidden; display: flex; flex-direction: column;">
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">${item.name}</span>
                        <span style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.7;">${dateStr}, ${timeStr}</span>
                    </div>
                `;
                historyList.appendChild(entry);
            });
        }

        const currentChat = history.find(item => item.id === chatId);
        if (currentChat && currentChat.messages && currentChat.messages.length > 0) {
            messageContainer.innerHTML = "";
            currentChat.messages.forEach(msg => {
                renderMessageToDOM(msg.text, msg.sender, msg.isError, msg.files);
            });
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    // Renders the assistant's Markdown reply (headings, lists, tables, code
    // blocks, bold, links, etc.) into safe HTML - the same way mainstream AI
    // chat UIs display responses. Falls back to plain text if the Markdown
    // libraries are unavailable (e.g. offline).
    function formatResponse(text) {
        if (!text) return "";

        if (typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {
            try {
                const html = marked.parse(text, { gfm: true, breaks: true });
                return DOMPurify.sanitize(html);
            } catch (e) {
                console.error("Markdown render failed:", e);
            }
        }

        // Fallback: minimal, safe formatting
        return escapeHtml(text)
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/`([^`]+?)`/g, "<code>$1</code>")
            .replace(/\n/g, "<br>");
    }

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            if (window.showToast) showToast("Copied to clipboard!", "success");
            const original = btn.innerHTML;
            btn.innerHTML = "✓ Copied";
            btn.style.color = "#22c55e";
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.color = "";
            }, 2000);
        });
    }

    function saveMessageToLocal(text, sender, isError = false, files = null) {
        let history = JSON.parse(localStorage.getItem(historyKey) || "[]");
        let currentChat = history.find(item => item.id === chatId);

        if (!currentChat) {
            currentChat = { id: chatId, name: assistantType, messages: [], lastUpdated: Date.now() };
            history.unshift(currentChat);
        }

        if (!currentChat.messages) currentChat.messages = [];
        currentChat.messages.push({ text, sender, isError, files, timestamp: Date.now() });
        currentChat.lastUpdated = Date.now();

        history = history.filter(item => item.id !== chatId);
        history.unshift(currentChat);

        localStorage.setItem(historyKey, JSON.stringify(history));
        loadHistoryAndMessages();
    }

    window.clearHistory = () => {
        if (confirm("Clear all recent chat history for this user?")) {
            localStorage.removeItem(historyKey);
            location.reload();
        }
    };

    window.startNewChat = () => {
        const newChatId = "chat_" + Date.now();
        window.location.href = `chat.html?assistant=${encodeURIComponent(assistantType)}&chatId=${newChatId}`;
    };

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (!currentUser) {
            showAuthModal();
            return;
        }
        const message = messageInput.value.trim();
        if (!message && selectedFiles.length === 0) return;

        // Local Preview for Files (Base64)
        const localFileData = [];
        const filePromises = selectedFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    localFileData.push({
                        name: file.originalname || file.name,
                        url: ev.target.result,
                        type: file.type,
                        isImage: file.type.startsWith("image/")
                    });
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        });

        await Promise.all(filePromises);

        addMessage(message, "user", false, localFileData);

        const formData = new FormData();
        formData.append("message", message);
        formData.append("assistantType", assistantType);
        selectedFiles.forEach(file => formData.append("files", file));

        messageInput.value = "";
        selectedFiles = [];
        attachmentPreview.innerHTML = "";
        updatePreviewVisibility();

        const loadingId = addLoadingIndicator();

        try {
            const res = await fetch(`${window.API_BASE}/api/chat`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            removeLoadingIndicator(loadingId);

            if (res.ok) {
                addMessage(data.reply, "bot", false, data.files);
            } else {
                addMessage(data.message || "I'm having trouble connecting right now.", "bot", true);
            }
        } catch (err) {
            console.error("Chat Error:", err);
            removeLoadingIndicator(loadingId);
            addMessage("Server unreachable. Please ensure the backend is running.", "bot", true);
        }
    });

    function addMessage(text, sender, isError = false, files = null) {
        renderMessageToDOM(text, sender, isError, files);
        saveMessageToLocal(text, sender, isError, files);
    }

    function renderMessageToDOM(text, sender, isError = false, files = null) {
        // Remove welcome screen if present
        const welcome = document.querySelector(".welcome-center");
        if (welcome) welcome.remove();

        const group = document.createElement("div");
        group.className = `msg-group ${sender}-msg-group animate-slide-up`;

        const icon = sender === 'user' ? '👤' : config.icon;

        let filesHtml = "";
        if (files && files.length > 0) {
            filesHtml = `<div class="message-attachment">`;
            files.forEach(file => {
                if (file.isImage) {
                    filesHtml += `<img src="${file.url}" alt="${file.name}" onclick="window.open('${file.url}', '_blank')">`;
                } else {
                    filesHtml += `
                        <a href="${file.url}" target="_blank" class="file-attachment">
                            <span>📄</span>
                            <span style="word-break: break-all;">${file.name}</span>
                        </a>
                    `;
                }
            });
            filesHtml += `</div>`;
        }

        const formattedText = sender === 'bot' ? formatResponse(text) : escapeHtml(text).replace(/\n/g, '<br>');

        const actionButtons = `
            <div class="msg-actions">
                <button class="msg-action-btn" onclick="window.copyMsg(this)" title="Copy to clipboard">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>Copy</span>
                </button>
                <button class="msg-action-btn" onclick="window.pasteToInput(this)" title="Paste into input">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    <span>Edit</span>
                </button>
            </div>
        `;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        group.innerHTML = `
            <div class="msg-avatar ${sender}-avatar">${icon}</div>
            <div class="msg-content">
                <div class="msg-bubble ${sender}-bubble" ${isError ? 'style="border-color: #ef4444; color: #ef4444;"' : ''}>
                    ${formattedText}
                    ${filesHtml}
                </div>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 4px; padding: 0 4px;">
                    <span style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.6;">${time}</span>
                    ${actionButtons}
                </div>
            </div>
        `;

        messageContainer.appendChild(group);
        scrollToBottom();
    }

    // Expose copy function
    window.copyMsg = (btn) => {
        const bubble = btn.closest('.msg-content').querySelector('.msg-bubble');
        const textToCopy = bubble.innerText;
        copyToClipboard(textToCopy, btn);
    };

    window.pasteToInput = (btn) => {
        const bubble = btn.closest('.msg-content').querySelector('.msg-bubble');
        const text = bubble.innerText;
        messageInput.value = text;
        messageInput.focus();
        // Trigger auto-resize
        messageInput.dispatchEvent(new Event('input'));

        // Visual feedback
        const original = btn.innerHTML;
        btn.innerHTML = "✓ Pasted";
        btn.style.color = "#22c55e";
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.color = "";
        }, 1500);
    };

    function addLoadingIndicator() {
        const id = "loading-" + Date.now();
        const group = document.createElement("div");
        group.id = id;
        group.className = "msg-group bot-msg-group";
        group.innerHTML = `
            <div class="msg-avatar bot-avatar">${config.icon}</div>
            <div class="msg-content">
                <div class="msg-bubble bot-bubble">
                    <div class="typing-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>
        `;
        messageContainer.appendChild(group);
        scrollToBottom();
        return id;
    }

    function removeLoadingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        const b = document.getElementById("chatBody");
        if (!b) return;

        // Use requestAnimationFrame to ensure DOM is rendered
        requestAnimationFrame(() => {
            b.scrollTo({
                top: b.scrollHeight,
                behavior: 'auto' // 'auto' is faster and more reliable than 'smooth' during rapid updates
            });
        });
    }

    window.showAuthModal = () => {
        const modal = document.getElementById("authModal");
        if (modal) modal.classList.add("active");
    };

    window.closeAuthModal = () => {
        const modal = document.getElementById("authModal");
        if (modal) modal.classList.remove("active");
    };

    // Advanced Attachment Menu Logic
    window.toggleAttachMenu = (e) => {
        e.stopPropagation();
        const menu = document.getElementById("attachMenu");
        if (menu) menu.classList.toggle("active");
    };

    window.handleMenuAction = (action) => {
        const menu = document.getElementById("attachMenu");
        if (menu) menu.classList.remove("active");

        switch (action) {
            case 'upload':
                document.getElementById('fileInput').click();
                break;
            case 'text':
                showToast("Add text content: Feature coming soon!", "info");
                break;
            case 'sketch':
                showToast("Draw a sketch: Feature coming soon!", "info");
                break;
            case 'drive':
                showToast("Google Drive: Feature coming soon!", "info");
                break;
            case 'onedrive':
                showToast("Microsoft OneDrive: Feature coming soon!", "info");
                break;
            case 'recent':
                showToast("Recent uploads: Feature coming soon!", "info");
                break;
        }
    };

    // Close menu when clicking outside
    document.addEventListener("click", () => {
        const menu = document.getElementById("attachMenu");
        if (menu && menu.classList.contains("active")) {
            menu.classList.remove("active");
        }
    });

    scrollToBottom();
});

