// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

// Import Firestore and functions used to access and update user data
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Import Firebase Authentication
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    // Identifies firebase project to link to
  apiKey: "AIzaSyAg6x7b7ZsPylQ2CyRbiemLOr_txEv22Kk",
  authDomain: "the-great-canadian-swim--ipots.firebaseapp.com",
  projectId: "the-great-canadian-swim--ipots",
  storageBucket: "the-great-canadian-swim--ipots.firebasestorage.app",
  messagingSenderId: "159069607210",
  appId: "1:159069607210:web:55c0efdb1b5ecac9cc7a53",
  measurementId: "G-V6ZJ5CLM1W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// Get the HTML elements
const totalDays = document.getElementById("total-days");
const totalDistance = document.getElementById("total-distance");
const totalTime = document.getElementById("total-time");

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (month < 10) {
        month = "0" + month;
    }

    if (day < 10) {
        day = "0" + day;
    }

    return year + "-" + month + "-" + day;
}

// Load the user's swimming information
onAuthStateChanged(auth, async user => {
    currentUser = user;

    if (!user) return;

    try {
        // Get the user's main document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();

            // Display the total number of completed days
            totalDays.value = userData.completedDays || 0;
        }

        // Get today's swimming activity document
        const today = getTodayDate();
        const activityRef = doc(db, "users", user.uid, "activity", today);
        const activitySnap = await getDoc(activityRef);

        if (activitySnap.exists()) {
            const activityData = activitySnap.data();

            // Display today's distance directly in kilometres
            totalDistance.value = Number(activityData.distance || 0).toFixed(1);

            // Display today's swimming time directly from Firebase
            totalTime.value = Number(activityData.hours || 0).toFixed(2);
        } else {
            // No swimming activity recorded today
            totalDistance.value = "0.0";
            totalTime.value = "0.00";
        }
    } catch (error) {
        console.error("Error loading swimming information:", error);
    }
});

// Return to the main page
const viewJourney = document.getElementById("view-journey");

function callMainPage() {
    window.location.href = "index-main-page.html";
}

viewJourney.addEventListener("click", callMainPage);
