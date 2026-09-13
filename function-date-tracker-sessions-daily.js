let settings = document.getElementById("settings-box");

function callSettingsPage() {
    window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);

// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// Import Firestore and functions used to access and update user data within
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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

    let displayedDate = new Date();

    const dateButton = document.getElementById("dateButton");

    const dateSelection = document.getElementById("dateSelected");

    // Function to format the visible date
    function updateDateButton(date) {
        document.getElementById("dateText").textContent = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    // Click the visible button
    dateButton.addEventListener("click", () => {
        if (typeof dateSelection.showPicker === "function") {
            dateSelection.showPicker();
        }
    });

    // When the user selects a date
    dateSelection.addEventListener("change", function () {
        const selectedDate = new Date(this.value + "T00:00:00");

        displayedDate = selectedDate;

        // Update visible button
        updateDateButton(displayedDate);

        // Load selected day's data
        loadDay(displayedDate);
    });

    const backButton = document.getElementById("back-picture");

    backButton.addEventListener("click", function () {
        // Go back one day
        displayedDate.setDate(displayedDate.getDate() - 1);

        // Load that day's data
        loadDay(displayedDate);
    });

    const forwardButton = document.getElementById("forward-picture");

    forwardButton.addEventListener("click", function () {
        displayedDate.setDate(displayedDate.getDate() + 1);

        loadDay(displayedDate);
    });

    function loadDay(date) {
        // Update the date picker to match the date being displayed
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        document.getElementById("dateSelected").value = year + "-" + month + "-" + day;

        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
        // Update the visible date button
        document.getElementById("dateText").textContent = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        let found = false;

        // Go through all Firestore activity documents
        snapshot.forEach((activityDoc) => {
            const data = activityDoc.data();

            // Convert Firestore date into a Date object
            const [year, month, day] = data.date.split("-");

            const activityDate = new Date(year, month - 1, day);
            // Compare the year, month, and day
            if (activityDate.getFullYear() === date.getFullYear() && activityDate.getMonth() === date.getMonth() && activityDate.getDate() === date.getDate()) {
                found = true;

                // We found the correct day
                console.log("Found:", data);

                const sessions = data.sessions;

                // Put the distance into the HTML
                document.getElementById("total-sessions").value = sessions;

                // Put the distance into the graph
                drawStuff(sessions);
            }
        });
        if (!found) {
            document.getElementById("total-sessions").value = 0;
            drawStuff(0);
        }
    }
    loadDay(displayedDate);
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
