/*
 * Frontend runtime config.
 * Load this BEFORE any other script that calls the backend API.
 *
 * Local dev  -> talks to the Express server on http://127.0.0.1:5000
 * Production -> same origin ("" prefix); Vercel rewrites /api/* and
 *               /uploads/* to the serverless backend.
 */
(function () {
    var host = location.hostname;
    var isLocal = host === "localhost" || host === "127.0.0.1" || host === "";
    window.API_BASE = isLocal ? "http://127.0.0.1:5000" : "";
})();
