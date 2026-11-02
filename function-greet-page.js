// Import Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// Import Firestore
import { getFirestore, doc, onSnapshot, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Import Firebase Authentication
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
    authDomain: "testing-database-c0a2c.firebaseapp.com",
    projectId: "testing-database-c0a2c",
    storageBucket: "testing-database-c0a2c.firebasestorage.app",
    messagingSenderId: "879740645963",
    appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
    measurementId: "G-TVHDNT78JT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect HTML elements
const expDisplay = document.getElementById("exp");
const levelDisplay = document.getElementById("level");
const streakDisplay = document.getElementById("streak");
const dayNumberDisplay = document.getElementById("day-number");
const greetingDisplay = document.getElementById("greeting");
const calendar = document.getElementById("dateSelected");

let wordQuoteBox = document.getElementById("word-quote-box");

// Updating Quotes
let quotes = [
  "Effort is the point. - Stephanie Manica",
  "Trying Counts. - Stephanie Manica",
  "You Belong Here. - Stephanie Manica",
  "If you showed up, it counts. - Stephanie Manica",
  "Effort looks different. - Stephanie Manica",
  "You're allowed to stop. - Stephanie Manica",
  "This includes you. - Stephanie Manica",
  "Trying is human. - Stephanie Manica",
  "One attempt is enough. - Stephanie Manica",
  "Outcomes are optional. - Stephanie Manica",
  "Different still counts. - Stephanie Manica",
  "Invisible effort still counts. - Stephanie Manica",
  "Today can look different. - Stephanie Manica",
  "You don't have to win. - Stephanie Manica",
  "This moment counts. - Stephanie Manica",
  "There is no wrong way to try. - Stephanie Manica",
  "Trying is not a straight line. - Stephanie Manica",
  "Listening to your body counts. - Stephanie Manica",
  "Today is enough. - Stephanie Manica",
  "Today, I chose to try. - Stephanie Manica",
  "I am stronger than the voice that says I can't. - Stephanie Manica",
  "Small efforts create meaningful change. - Stephanie Manica",
  "Begin where you are use what you have. - Stephanie Manica",
  "I don't have to be fast to make progress. - Stephanie Manica",
  "Every stroke is a step forward. - Stephanie Manica",
  "Today showing up is enough. - Stephanie Manica",
  "Turning daily swims into national impact",
  "Resilience has many forms. - Stephanie Manica",
  "Keep moving forward. - Stephanie Manica",
  "What seems impossible is often just unfinished. - Stephanie Manica",
  "Your distance counts too. - Stephanie Manica",
  "The Great Canadian Swim continues. - Stephanie Manica",
  "Every body moves differently. - Stephanie Manica",
  "Small efforts, big impact. - Stephanie Manica",
  "Consistency is a superpower. - Stephanie Manica",
  "Every journey matters. - Stephanie Manica",
  "More than a swim. - Stephanie Manica",
  "Progress isn't always visible. - Stephanie Manica",
  "Progress lives in the everyday. - Stephanie Manica",
  "Great things grow from small daily actions. - Stephanie Manica",
  "Progress is better together. - Stephanie Manica",
  "Building a coast to coast movement. - Stephanie Manica",
  "Showing up looks different everyday. - Stephanie Manica",
  "Every stroke counts. - Stephanie Manica",
  "Hope lives in the next stroke. - Stephanie Manica",
  "Show up with us. - Stephanie Manica",
  "Canada's longest lesson in consistency. - Stephanie Manica",
  "Participation is powerful. - Stephanie Manica",
  "Consistency creates possibility. - Stephanie Manica",
  "Resilience is repetition. - Stephanie Manica",
  "Join the movement. - Stephanie Manica",
  "A swim for every body. - Stephanie Manica",
  "Adaptive effort is still effort. - Stephanie Manica",
  "Showing up changes everything. - Stephanie Manica",
  "Keep going. - Stephanie Manica",
  "The water doesn't care. Show up anyway. - Stephanie Manica",
  "One day. One swim. One step forward. - Stephanie Manica"
];

const today = new Date();

const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

const quoteNumber = dayOfYear % quotes.length;

wordQuoteBox.textContent = quotes[quoteNumber];


let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();

// Conditional for Calendar Feature
if (day < 10) {
  day = "0" + day;
}

if (month < 10) {
  month = "0" + month;
}
// Put calendar values in correct format (html is very specific) link: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
calendar.value = year + "-" + month + "-" + day;

const dateButton = document.getElementById("dateButton");

dateButton.textContent = today.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

// Function to update the greeting based on the current time
function updateGreeting(username) {
    const hour = new Date().getHours();

    let timeOfDay;

    if (hour >= 5 && hour < 12) {
        timeOfDay = "Morning";
    } else if (hour >= 12 && hour < 17) {
        timeOfDay = "Afternoon";
    } else if (hour >= 17 && hour < 21) {
        timeOfDay = "Evening";
    } else {
        timeOfDay = "Night";
    }

    greetingDisplay.textContent = "Good " + timeOfDay + ", " + username + "! 👋";
}

// Wait for Firebase to determine the logged-in user
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log("No user is signed in.");
        return;
    }

    console.log("Signed-in user:", user.uid);

    updateStreak(user);

    // Get the user's document
    const userRef = doc(db, "users", user.uid);

    // Listen for changes to the user's data
    onSnapshot(userRef, (docSnap) => {
        if (!docSnap.exists()) {
            console.log("User document does not exist.");
            return;
        }

        const userData = docSnap.data();

        // Get EXP
        const exp = userData.exp || 0;

        // Get Level
        const level = userData.level || 0;

        // Get Day Number
        const dayNumber = userData.dayNumber || 1;

        // Get Username
        const username = userData.username || "User";

        // Display the values
        expDisplay.value = exp;
        levelDisplay.value = level;
        dayNumberDisplay.innerHTML = "Day #" + dayNumber;

        // Display the greeting
        updateGreeting(username);
    });
});

function getTodayDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

async function updateStreak(user) {
    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return;
    }

    const userData = userSnap.data();

    const today = getTodayDate();

    const lastStreakDate = userData.lastStreakDate || "";
    const currentStreak = userData.streak || 0;

    // If today's effort has already been counted, don't increase it again
    if (lastStreakDate === today) {
        streakDisplay.value = currentStreak;
        return;
    }

    let newStreak = 1;

    // Check if the last effort was yesterday
    if (lastStreakDate) {
        const lastDate = new Date(lastStreakDate + "T00:00:00");
        const todayDate = new Date(today + "T00:00:00");

        const difference = (todayDate - lastDate) / (1000 * 60 * 60 * 24);

        if (difference === 1) {
            newStreak = currentStreak + 1;
        }
    }

    await updateDoc(userRef, {
        streak: newStreak,
        lastStreakDate: today,
    });

    streakDisplay.value = newStreak;
}

// Update the greeting every minute
setInterval(() => {
    const user = auth.currentUser;

    if (user) {
        const userRef = doc(db, "users", user.uid);

        onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const username = userData.username || "User";

                updateGreeting(username);
            }
        });
    }
}, 60000);

setInterval(() => {
 window.location.href = "index-main-page.html";
}, 8000);