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

    // This represents the week being displayed
    let displayedDate = new Date();
    const dateButton = document.getElementById("dateButton");
    const weekSelection = document.getElementById("dateSelected");

    function getWeekInputValue(date) {
        const tempDate = new Date(date);

        // Find Thursday of the current week
        tempDate.setDate(tempDate.getDate() + 4 - tempDate.getDay());

        const year = tempDate.getFullYear();

        // Find the first day of the year
        const yearStart = new Date(year, 0, 1);

        // Calculate the week number
        const daysPassed = (tempDate - yearStart) / 86400000;
        const weekNumber = Math.ceil((daysPassed + 1) / 7);

        // Add a 0 if the week number is less than 10
        let weekText = weekNumber;

        if (weekNumber < 10) {
            weekText = "0" + weekNumber;
        }

        return year + "-W" + weekText;
    }

    // Convert YYYY-W## into the Sunday of that week
    function getDateFromWeek(weekValue) {
        const parts = weekValue.split("-W");

        const year = Number(parts[0]);
        const week = Number(parts[1]);

        // January 1st
        const januaryFirst = new Date(year, 0, 1);

        // Find the first Sunday
        const firstSunday = new Date(januaryFirst);

        firstSunday.setDate(januaryFirst.getDate() - januaryFirst.getDay());

        // Find the Sunday of the selected week
        const selectedSunday = new Date(firstSunday);

        selectedSunday.setDate(firstSunday.getDate() + (week - 1) * 7);

        // Set the time to midnight
        selectedSunday.setHours(0, 0, 0, 0);

        return selectedSunday;
    }

    // Update the visible week text
    function updateDateButton(startOfWeek, endOfWeek) {
        document.getElementById("dateText").textContent =
            startOfWeek.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }) +
            " – " +
            endOfWeek.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
    }

    // When the user selects a week
    weekSelection.addEventListener("change", function () {
        const selectedWeek = this.value;

        // Convert selected week into a date
        displayedDate = getDateFromWeek(selectedWeek);

        // Load the selected week
        loadWeek(displayedDate);
    });

    // Open the week picker when the button is clicked
    dateButton.addEventListener("click", () => {
        weekSelection.showPicker();
    });

    const backButton = document.getElementById("back-picture");

    backButton.addEventListener("click", function () {
        // Go back one week
        displayedDate.setDate(displayedDate.getDate() - 7);

        // Load that week's data
        loadWeek(displayedDate);
    });

    const forwardButton = document.getElementById("forward-picture");

    forwardButton.addEventListener("click", function () {
        // Go forward one week
        displayedDate.setDate(displayedDate.getDate() + 7);

        // Load that week's data
        loadWeek(displayedDate);
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

    function loadWeek(date) {
        // Find the Sunday of this week
        const startOfWeek = new Date(date);

        startOfWeek.setDate(date.getDate() - date.getDay());

        startOfWeek.setHours(0, 0, 0, 0);

        // Find the Saturday of this week
        const endOfWeek = new Date(startOfWeek);

        endOfWeek.setDate(startOfWeek.getDate() + 6);

        endOfWeek.setHours(23, 59, 59, 999);

        // Update the week input
        weekSelection.value = getWeekInputValue(startOfWeek);

        // Update visible week
        updateDateButton(startOfWeek, endOfWeek);

        let totalDistance = 0;

        // Store distance for each day
        let dailyDistances = [0, 0, 0, 0, 0, 0, 0];

        // Go through all Firestore activity documents
        snapshot.forEach((activityDoc) => {
            const data = activityDoc.data();

            // Convert Firestore date into a Date object
            const [year, month, day] = data.date.split("-");

            const activityDate = new Date(year, month - 1, day);

            // Make sure activityDate only uses the date
            activityDate.setHours(0, 0, 0, 0);

            // Check if activity is inside this week
            if (activityDate >= startOfWeek && activityDate <= endOfWeek) {
                const distanceValue = data.distance;

                // Add to weekly total
                totalDistance += distanceValue;

                // Get the day of the week
                const dayNumber = activityDate.getDay();

                // Add distance to that day
                dailyDistances[dayNumber] += distanceValue;
            }
        });

        distance = totalDistance;

        // Calculate average distance
        averageDistance = totalDistance / 7;

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

        // Convert daily distances from kilometers to meters
let graphDistances = [];

for (let i = 0; i < dailyDistances.length; i++) {
    graphDistances.push(dailyDistances[i] * 1000);
}

// Draw the graph in meters
drawStuff(graphDistances);
    }

    // Set the week input to the current week
    weekSelection.value = getWeekInputValue(displayedDate);
    // Load the current week when the page opens
    loadWeek(displayedDate);
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
