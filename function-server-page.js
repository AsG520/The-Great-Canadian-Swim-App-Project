const socket = io("http://localhost:3000");
const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

const name = prompt("What is your name?");
appendMessage("You joined");
socket.emit("new-user", name);

socket.on("chat-message", (data) => {
    appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
    appendMessage(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
    appendMessage(`${name} disconnected`);
});

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", message);
    console.log(message);
    messageInput.value = "";
});

function appendMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}

let exit = document.getElementById("exit-button");
let darkMode = document.getElementById("dark-mode");
let lightMode = document.getElementById("light-mode");
let serverRules = document.getElementById("server-rules");
let sendContainer = document.getElementById("send-container");
let send = document.getElementById("send-button");
let regularMode = document.getElementById("regular-mode");

function callJoinServerPage() {
    let confirmExit = confirm("Do you want to exit?");

    if (confirmExit) {
        window.location.href = "index-join-server-page.html";
    }
}

function callDarkMode() {
    document.body.style.background = "black";
    sendContainer.style.background = "white";
    messageContainer.style.background = "white";
    serverRules.style.color = "black";
    exit.style.color = "black";
    send.style.color = "black";
    lightMode.style.backgroundColor = "lightgrey";
    darkMode.style.backgroundColor = "lightgrey";
    regularMode.style.backgroundColor = "lightgrey";
    messageInput.style.background = "black";
    messageInput.style.color = "white";
}

function callLightMode() {
    document.body.style.background = "white";
    sendContainer.style.background = "black";
    messageContainer.style.background = "black";
    serverRules.style.color = "white";
    exit.style.color = "white";
    send.style.color = "white";
    lightMode.style.backgroundColor = "white";
    darkMode.style.backgroundColor = "white";
    regularMode.style.backgroundColor = "white";
    messageInput.style.background = "white";
    messageInput.style.color = "black";
}

function callRegularMode() {
    document.body.style.background = "linear-gradient(to right, #4a00e0, #8e2de2)";
    sendContainer.style.background = "black";
    messageContainer.style.background = "rgba(0, 0, 0, 0.5)";
    serverRules.style.color = "white";
    exit.style.color = "white";
    send.style.color = "white";
    lightMode.style.backgroundColor = "white";
    darkMode.style.backgroundColor = "white";
    regularMode.style.backgroundColor = "white";
    messageInput.style.background = "rgba(239, 240, 242, 0.5)";
    messageInput.style.color = "rgb(28, 60, 101)";
}

function callServerRulesPage() {
    window.location.href = "index-server-rules-page.html";
}

exit.addEventListener("click", callJoinServerPage);
darkMode.addEventListener("click", callDarkMode);
lightMode.addEventListener("click", callLightMode);
regularMode.addEventListener("click", callRegularMode);
serverRules.addEventListener("click", callServerRulesPage);