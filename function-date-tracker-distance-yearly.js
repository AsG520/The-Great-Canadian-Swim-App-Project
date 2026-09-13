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

    // Get all activity documents
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

    let distance = 0;

    let distanceDisplay = document.getElementById("total-distance");

    const unitSelection = document.getElementById("unit-details");

    unitSelection.addEventListener("change", function () {
        const unit = this.value;

        let displayedDistance = distance;

        if (unit === "Meters") {
            displayedDistance = distance * 1000;
        } else if (unit === "Kilometers") {
            displayedDistance = distance;
        }

        distanceDisplay.value = displayedDistance.toFixed(2);

    });

    let averageDistance = 0;

    let averageDistanceDisplay = document.getElementById("average-distance");

    const averageUnitSelection = document.getElementById("average-unit-details");

    averageUnitSelection.addEventListener("change", function () {
        const averageUnit = this.value;

        let displayedAverageDistance = averageDistance;

        if (averageUnit === "Meters") {
            displayedAverageDistance = averageDistance * 1000;
        } else if (averageUnit === "Kilometers") {
            displayedAverageDistance = averageDistance;
        }
        averageDistanceDisplay.value = displayedAverageDistance.toFixed(2);
    });

    function loadYear(date) {
        // Get the year being displayed
        const selectedYear = date.getFullYear();

        // Display the year
        document.getElementById("current-date").textContent = selectedYear;

        // Total distance for the year
        let totalDistance = 0;

        // Store distance for each month
        let monthlyDistances = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Go through all Firestore activity documents
        snapshot.forEach((activityDoc) => {
            const data = activityDoc.data();

            // Convert Firestore date into a Date object
            const [year, month, day] = data.date.split("-");

            const activityDate = new Date(year, month - 1, day);

            // Check if activity belongs to this year
            if (activityDate.getFullYear() === selectedYear) {
                // Convert km to meters
                const distanceValue = data.distance;

                // Add to yearly total
                totalDistance += distanceValue;

                // Get the month
                const monthNumber = activityDate.getMonth();

                // Add distance to that month
                monthlyDistances[monthNumber] += distanceValue;
            }
        });

        distance = totalDistance;

        averageDistance = totalDistance / 12;

        const unit = unitSelection.value;

        let displayedDistance = distance;

        if (unit === "Meters") {
            displayedDistance = distance * 1000;
        } else if (unit === "Kilometers") {
            displayedDistance = distance;
        }

        distanceDisplay.value = displayedDistance.toFixed(2);

        const averageUnit = averageUnitSelection.value;

        let displayedAverageDistance = averageDistance;

        if (averageUnit === "Meters") {
            displayedAverageDistance = averageDistance * 1000;
        } else if (averageUnit === "Kilometers") {
            displayedAverageDistance = averageDistance;
        }

        averageDistanceDisplay.value = displayedAverageDistance.toFixed(2);
   
        drawStuff(monthlyDistances);
    }
    // Load the current year when the page opens
    loadYear(displayedDate);
});

const dropdown = document.getElementById("date-tracker-details");
/*let distanceDisplay = document.getElementById("total-distance");
let averageDistanceDisplay = document.getElementById("average-distance");*/

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
