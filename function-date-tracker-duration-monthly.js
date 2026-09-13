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

    // This represents the month being displayed
    let displayedDate = new Date();

    const dateButton = document.getElementById("dateButton");

    const monthSelection = document.getElementById("dateSelected");

    function updateDateButton(date) {
        document.getElementById("dateText").textContent = date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
    }

    // When the user selects a month
    monthSelection.addEventListener("change", function () {
        const [year, month] = this.value.split("-");

        // Create a Date object for the selected month
        displayedDate = new Date(Number(year), Number(month) - 1, 1);

        // Update the visible button
        updateDateButton(displayedDate);

        // Load the selected month
        loadMonth(displayedDate);
    });

    // Set the month picker to the current month
    const currentYear = displayedDate.getFullYear();

    const currentMonth = String(displayedDate.getMonth() + 1).padStart(2, "0");

    monthSelection.value = currentYear + "-" + currentMonth;

    // Display the current month on the button
    updateDateButton(displayedDate);

    // Open the month picker when the button is clicked
    dateButton.addEventListener("click", () => {
        monthSelection.showPicker();
    });

    const backButton = document.getElementById("back-picture");

    backButton.addEventListener("click", function () {
        // Go back one month
        displayedDate.setMonth(displayedDate.getMonth() - 1);

        // Load that month's data
        loadMonth(displayedDate);
    });

    const forwardButton = document.getElementById("forward-picture");

    forwardButton.addEventListener("click", function () {
        // Go forward one month
        displayedDate.setMonth(displayedDate.getMonth() + 1);

        // Load that month's data
        loadMonth(displayedDate);
    });

    let duration = 0;

    let dailyDurations = [];

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

    function loadMonth(date) {
        const year = date.getFullYear();
        const month2 = String(date.getMonth() + 1).padStart(2, "0");

        document.getElementById("dateSelected").value = year + "-" + month2;
        updateDateButton(date);

        const month = date.getMonth();

        // Get the number of days in this month
        const numberOfDays = new Date(year, month + 1, 0).getDate();

        // Find the first day of the month
        const startOfMonth = new Date(year, month, 1);

        startOfMonth.setHours(0, 0, 0, 0);

        // Find the last day of the month
        const endOfMonth = new Date(year, month + 1, 0);

        endOfMonth.setHours(23, 59, 59, 999);

        let totalDuration = 0;

        let dailyDurations = new Array(numberOfDays).fill(0);

        // Go through all Firestore activity documents
        snapshot.forEach((activityDoc) => {
            const data = activityDoc.data();

            // Convert Firestore date into a Date object
            const [activityYear, activityMonth, activityDay] = data.date.split("-");

            const activityDate = new Date(activityYear, activityMonth - 1, activityDay);

            // Check if activity is inside this month
            if (activityDate >= startOfMonth && activityDate <= endOfMonth) {
                // Firestore stores duration in hours
                // Convert hours to minutes
                const durationValue = data.duration;

                // Add to monthly total
                totalDuration += durationValue;

                // Arrays start at 0, so subtract 1
                const dayNumber = activityDate.getDate() - 1;

                // Add duration to that day
                dailyDurations[dayNumber] += durationValue;
            }
        });

        duration = totalDuration;

        averageDuration = totalDuration / numberOfDays;

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

      
        drawStuff(dailyDurations);
    }

    // Load the current month when the page opens
    loadMonth(displayedDate);
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
