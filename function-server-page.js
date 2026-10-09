// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// FIREBASE SETUP
const firebaseConfig = {
  apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
  authDomain: "testing-database-c0a2c.firebaseapp.com",
  projectId: "testing-database-c0a2c",
  storageBucket: "testing-database-c0a2c.firebasestorage.app",
  messagingSenderId: "879740645963",
  appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// HTML ELEMENTS
const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

const exit = document.getElementById("exit-button");
const darkMode = document.getElementById("dark-mode");
const lightMode = document.getElementById("light-mode");
const serverRules = document.getElementById("server-rules");
const sendContainer = document.getElementById("send-container");
const send = document.getElementById("send-button");
const regularMode = document.getElementById("regular-mode");

// USER INFORMATION
let currentUser = null;
let currentUsername = "";

// AUTHENTICATION
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    console.log("Signed-in user:", user.uid);
    await getUsername();
    listenForMessages();
  } else {
    console.log("No user is signed in.");
    window.location.href = "index-login-page.html";
  }
});

// GET USERNAME FROM FIRESTORE
async function getUsername() {
  try {
    const profileRef = doc(db, "profiles", currentUser.uid);
    const profileSnapshot = await getDoc(profileRef);
    if (profileSnapshot.exists()) {
      const profileData = profileSnapshot.data();
      currentUsername = profileData.username;
      console.log("Username:", currentUsername);
    } else {
      console.log("Profile does not exist.");
      alert("Your profile could not be found.");
      window.location.href = "index-profile-page.html";
    }
  } catch (error) {
    console.error("Error getting username:", error);
    alert("There was a problem loading your profile.");
  }
}

// REAL-TIME CHAT
function listenForMessages() {
  const messagesRef = collection(db, "serverMessages");
  const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));
  onSnapshot(
    messagesQuery,
    (snapshot) => {
      messageContainer.innerHTML = "";
      let previousDate = "";

      snapshot.forEach((messageDocument) => {
        const messageData = messageDocument.data();

        // GET MESSAGE DATE
        let messageDate = "";
        if (messageData.timestamp) {
          const date = messageData.timestamp.toDate();
          messageDate = date.toLocaleDateString("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
        // ADD DATE SEPARATOR
        if (messageDate !== previousDate) {
          const dateElement = document.createElement("div");
          dateElement.classList.add("chat-date");
          dateElement.innerText = messageDate;
          messageContainer.appendChild(dateElement);
          previousDate = messageDate;
        }
        // CREATE MESSAGE
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message");

        // Username and message
        const textElement = document.createElement("div");
        textElement.classList.add("message-text");
        textElement.innerText =
          messageData.username + ": " + messageData.message;
        // Put message together
        messageElement.appendChild(textElement);
        messageContainer.appendChild(messageElement);
      });

      // SCROLL TO BOTTOM
      messageContainer.scrollTop = messageContainer.scrollHeight;
    },
    (error) => {
      console.error("Error loading chat:", error);
    },
  );
}

// SEND MESSAGE
messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Make sure user is signed in
  if (!currentUser) {
    alert("You must be signed in to send a message.");
    return;
  }

  // Make sure username loaded
  if (currentUsername === "") {
    alert("Your username has not loaded yet.");
    return;
  }

  // Get message
  const message = messageInput.value.trim();

  // Do not allow empty messages
  if (message === "") {
    return;
  }
  try {
    await addDoc(collection(db, "serverMessages"), {
      userId: currentUser.uid,
      username: currentUsername,
      message: message,
      timestamp: serverTimestamp(),
    });
    // Clear input
    messageInput.value = "";
    messageInput.focus();
    messageInput.readOnly = true;

    setInterval(() => {
      messageInput.readOnly = false;
    }, 5000);
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Your message could not be sent.");
  }
});

// EXIT SERVER
function callJoinServerPage() {
  const confirmExit = confirm("Do you want to exit?");
  if (confirmExit) {
    window.location.href = "index-join-server-page.html";
  }
}

// DARK MODE
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

// LIGHT MODE
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

// REGULAR MODE
function callRegularMode() {
  document.body.style.background =
    "linear-gradient(to right, #4a00e0, #8e2de2)";
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

// SERVER RULES

function callServerRulesPage() {
  window.location.href = "index-server-rules-page.html";
}

// BUTTON EVENTS
exit.addEventListener("click", callJoinServerPage);
darkMode.addEventListener("click", callDarkMode);
lightMode.addEventListener("click", callLightMode);
regularMode.addEventListener("click", callRegularMode);
serverRules.addEventListener("click", callServerRulesPage);

/*
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
*/