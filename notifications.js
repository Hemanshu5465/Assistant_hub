/* Notification System Logic */
(function () {
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    function init() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    window.showToast = function (message, type = 'info', duration = 4000) {
        init();
        const container = document.querySelector('.toast-container');

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const title = type.charAt(0).toUpperCase() + type.slice(1);
        const icon = icons[type] || icons.info;

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close">&times;</div>
            <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
        `;

        container.appendChild(toast);

        // Animation entry
        setTimeout(() => toast.classList.add('active'), 10);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => removeToast(toast);

        // Auto remove
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, duration);

        function removeToast(el) {
            el.classList.remove('active');
            setTimeout(() => {
                if (el.parentElement) el.remove();
            }, 500);
            clearTimeout(timeout);
        }
    };

    // Replace global alert with toast
    window.alert = function (msg) {
        window.showToast(msg, 'info');
    };
})();
