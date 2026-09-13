let join = document.getElementById("join");

function callServer() {
    window.location.href = "index-server-page.html";
}

join.addEventListener("click", callServer);

let settings = document.getElementById("settings-box");

function callSettingsPage() {
    window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);
