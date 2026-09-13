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
    //Get all documents within the user's activity subcollection
    const snapshot = await getDocs(activityRef);

    //Creates the current date that the user is viewing (which is today)
    let displayedDate = new Date();

    /*const dateSelection = document.getElementById("dateSelected");

  dateSelection.value = displayedDate.toISOString().split("T")[0];

  dateSelection.addEventListener("click", () => {
    dateSelection.showPicker();
  });

  // Get the date selected from the date input
  dateSelection.addEventListener("change", function () {
    const selectedDate = new Date(this.value + "T00:00:00");
    displayedDate = selectedDate;
    loadDay(displayedDate);
  });*/
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
        dateSelection.showPicker();
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
        // Takes current date and sets it to one day back
        displayedDate.setDate(displayedDate.getDate() - 1);

        // Load that day's data
        loadDay(displayedDate);
    });

    const forwardButton = document.getElementById("forward-picture");

    forwardButton.addEventListener("click", function () {
        // Takes current date and sets it to one day forward
        displayedDate.setDate(displayedDate.getDate() + 1);

        // Load that day's data
        loadDay(displayedDate);
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
        // Change the number displayed
        distanceDisplay.value = displayedDistance.toFixed(2);

        // Change the graph
        drawStuff(displayedDistance);
    });

    function loadDay(date) {
        // Update the date picker to match the date being displayed
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        document.getElementById("dateSelected").value = year + "-" + month + "-" + day;

        // Update the date at the top
        // date is the value of displayDate
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString

        // Update the visible date button
        document.getElementById("dateText").textContent = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        // Haven't found the displayed document yet
        let found = false;

        // Go through all Firestore activity documents
        snapshot.forEach((activityDoc) => {
            const data = activityDoc.data(); // Gets the values of the selected date that the user is on

            // Convert Firestore date into a Date object
            // Takes firestores document names by date and separates the time stamps (2026-09-22) --> 2026, 09, 22 to use individualy
            const [year, month, day] = data.date.split("-");

            // Converts the date values to a JavaScript date  (firestore: January = 1 , February = 2, March = 3 /JavaScript: January = 0 , February = 1, March = 2 )
            const activityDate = new Date(year, month - 1, day);
            // Compare the year, month, and day
            //Checks if the document found has the same year, month and day
            if (activityDate.getFullYear() === date.getFullYear() && activityDate.getMonth() === date.getMonth() && activityDate.getDate() === date.getDate()) {
                found = true; //Have found the displayed document

                // We found the correct day
                console.log("Found:", data);

                //Get the distance from Firestore
                distance = data.distance;

                distanceDisplay.value = distance;

                // Put the distance into html

                // Put the distance into the graph
                drawStuff(distance);
            }
        });
        if (!found) {
            distance = 0;

            distanceDisplay.value = 0;

            drawStuff(0);
            /* // if no document matching is found display the value 0 (to show nothing)
      document.getElementById("total-distance").value = 0;
      drawStuff(0);*/
        }
    }
    // When start/refreshing the page start on today's date
    loadDay(displayedDate);
});

const dropdown = document.getElementById("date-tracker-details");
//let distanceDisplay = document.getElementById("total-distance");

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

/*const unitSelection = document.getElementById("unit-details"); 

unitSelection.addEventListener("change", function () {
    const unit = this.value;
    
    if (unit === "Meters") {
        distanceDisplay.value = (distanceDisplay.value * 1000).toFixed(2);
    } else if (unit === "Kilometers") {
        distanceDisplay.value = (distanceDisplay.value / 1000).toFixed(2);
    }
});*/
