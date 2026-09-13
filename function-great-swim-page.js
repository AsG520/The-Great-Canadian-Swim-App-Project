// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// Import Firestore and functions used to access and update user data within
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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

let currentUser = null;

let myTotalDistance = "";
let dayNumberSwum = "";

const totalDays = document.getElementById("total-days");
const totalDistance = document.getElementById("total-distance");

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!user) return;

    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Checks if document exists
            const userData = docSnap.data(); // Converst Firebase data to JavaScript =
            // Displays taken user data in a way it can be put on an html page to be seen

            myTotalDistance = userData.myDistance;
            totalDistance.value = myTotalDistance.toFixed(1);

            dayNumberSwum = userData.completedDays || 0;
            totalDays.value = dayNumberSwum;
        } else {
            console.log("No document found matching ID");
        }
    } catch (error) {
        console.error(error);
    }
});

let viewJourney = document.getElementById("view-journey");

function callMainPage() {
    window.location.href = "index-main-page.html";
}

viewJourney.addEventListener("click", callMainPage);
