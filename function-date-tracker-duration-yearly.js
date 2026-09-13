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

    let duration = 0;

    let durationDisplay = document.getElementById("total-duration");

    const unitSelection = document.getElementById("unit-details");

    unitSelection.addEventListener("change", function () {
        const unit = this.value;

        let displayedDuration = duration;

        if (unit === "Minutes") {
            displayedDuration = duration * 60;
        } else if (unit === "Hours") {
            displayedDuration = duration;
        }

        durationDisplay.value = displayedDuration.toFixed(2);

    });

    let averageDuration = 0;

    let averageDurationDisplay = document.getElementById("average-duration");

    const averageUnitSelection = document.getElementById("average-unit-details");

    averageUnitSelection.addEventListener("change", function () {
        const averageUnit = this.value;

        let displayedAverageDuration = averageDuration;

        if (averageUnit === "Minutes") {
            displayedAverageDuration = averageDuration * 60;
        } else if (averageUnit === "Hours") {
            displayedAverageDuration = averageDuration;
        }
        averageDurationDisplay.value = displayedAverageDuration.toFixed(2);
    });
    function loadYear(date) {
        // Find the year being displayed
        const year = date.getFullYear();

        // Display the year at the top
        document.getElementById("current-date").textContent = year;

        let totalDuration = 0;

        // Store duration for each month
        let monthlyDurations = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Go through all Firestore activity documents
        snapshot.forEach((activityDoc) => {
            const data = activityDoc.data();

            // Convert Firestore date into a Date object
            const [activityYear, month, day] = data.date.split("-");

            const activityDate = new Date(activityYear, month - 1, day);

            // Check if activity is inside this year
            if (activityDate.getFullYear() === year) {
                // Convert duration from hours to minutes
                const durationValue = data.duration;

                // Add to yearly total
                totalDuration += durationValue;

                // Get the month
                const monthNumber = activityDate.getMonth();

                // Add duration to that month
                monthlyDurations[monthNumber] += durationValue;
            }
        });

        duration = totalDuration;

        averageDuration = totalDuration / 12;

        const unit = unitSelection.value;

        let displayedDuration = duration;

        if (unit === "Minutes") {
            displayedDuration = duration * 60;
        } else if (unit === "Hours") {
            displayedDuration = duration;
        }

        durationDisplay.value = displayedDuration.toFixed(2);

        const averageUnit = averageUnitSelection.value;

        let displayedAverageDuration = averageDuration;

        if (averageUnit === "Minutes") {
            displayedAverageDuration = averageDuration * 60;
        } else if (averageUnit === "Hours") {
            displayedAverageDuration = averageDuration;
        }
        averageDurationDisplay.value = displayedAverageDuration.toFixed(2);

        let graphDurations = monthlyDurations;

        // Draw the graph
        drawStuff(graphDurations);
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
