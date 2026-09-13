let settings = document.getElementById("settings-box");

function callSettingsPage() {
    window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);

// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

// Import Firestore and functions used to access and update user data within
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Import Firebase Authentication
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    // Identifies firebase project to link to
    apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
    authDomain: "testing-database-c0a2c.firebaseapp.com",
    projectId: "testing-database-c0a2c",
    storageBucket: "testing-database-c0a2c.firebasestorage.app",
    messagingSenderId: "879740645963",
    appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
};

// Initialize firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("No user is signed in.");
        return;
    }

    // Get this user's activity
    const activityRef = collection(db, "users", user.uid, "activity");

    const snapshot = await getDocs(activityRef);

    // This represents the year being displayed
    let displayedDate = new Date();

    const backButton = document.getElementById("back-picture");

    backButton.addEventListener("click", function () {
        // Go back one year
        displayedDate.setFullYear(displayedDate.getFullYear() - 1);

        // Load that year's data
        loadYear(displayedDate);
    });

    const forwardButton = document.getElementById("forward-picture");

    forwardButton.addEventListener("click", function () {
        // Go forward one year
        displayedDate.setFullYear(displayedDate.getFullYear() + 1);

        // Load that year's data
        loadYear(displayedDate);
    });

    function loadYear(date) {
        // Get the year being displayed
        const year = date.getFullYear();

        // Display the year at the top
        document.getElementById("current-date").textContent = year;

        let totalSessions = 0;

        // Store sessions for each month
        let monthlySessions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Go through all Firestore activity documents
        snapshot.forEach((activityDoc) => {
            const data = activityDoc.data();

            // Convert Firestore date into a Date object
            const [activityYear, month, day] = data.date.split("-");

            const activityDate = new Date(activityYear, month - 1, day);

            // Check if activity is inside this year
            if (activityDate.getFullYear() === year) {
                // Sessions are already stored as a number
                const sessions = data.sessions;

                // Add to yearly total
                totalSessions += sessions;

                // Get the month
                const monthNumber = activityDate.getMonth();

                // Add sessions to that month
                monthlySessions[monthNumber] += sessions;
            }
        });

        // Put total sessions into HTML
        document.getElementById("total-sessions").value = totalSessions;

        // Calculate average sessions per month
        const averageSessions = totalSessions / 12;

        document.getElementById("average-sessions").value = averageSessions.toFixed(2);

        // Draw the graph
        drawStuff(monthlySessions);
    }

    // Load the current year when the page opens
    loadYear(displayedDate);
});

const dropdown = document.getElementById("date-tracker-details");

dropdown.addEventListener("change", function () {
    const selectedValue = this.value;

    if (selectedValue === "Distance") {
        window.location.href = "index-date-tracker-distance-daily.html";
    } else if (selectedValue === "Duration") {
        window.location.href = "index-date-tracker-duration-daily.html";
    } else if (selectedValue === "Session") {
        window.location.href = "index-date-tracker-sessions-daily.html";
    }
});
