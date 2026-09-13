// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// Import Firestore and functions used to access and update user data within
import { getFirestore, doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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

// Custom user message function
function customAlert(message) {
    // links to html element for formating
    const alertBox = document.getElementById("customAlert");

    document.getElementById("alertText").textContent = message;
    alertBox.style.display = "block";

    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000); // Hides after 3 seconds
}

// Initialize firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});
// Submit user information

// Link html sumbit but to js
const submit = document.getElementById("ok");

// When clicking the submit button this runs
submit.addEventListener("click", async () => {
    // Gets user's entered in details (with no spaces {.trim()} )
    const showupcheck = document.getElementById("showup-check");
    const improvehealthcheck = document.getElementById("improvehealth-check");
    const supportcommunitycheck = document.getElementById("supportcommunity-check");
    const otherreasoncheck = document.getElementById("otherreason-check");

    // Make sure every field is filled in
    if (!showupcheck.checked && !improvehealthcheck.checked && !supportcommunitycheck.checked && !otherreasoncheck.checked) {
        customAlert("Please select at least one option before continuing.");
        return;
    }
    // Stores user data in a document
    const userData = {
        showUp: showupcheck.checked,
        improveHealth: improvehealthcheck.checked,
        supportCommunity: supportcommunitycheck.checked,
        otherReason: otherreasoncheck.checked,
        yourGoalCompleted: true, // Sets value to true to save that the user has filled out the credentials page
    };
    // Gets logged in user UID
    const user = currentUser;

    if (!user) {
        customAlert("You must be signed in.");
        return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
        console.log("Current user:", auth.currentUser);
        console.log("Auth UID:", auth.currentUser?.uid);
        await updateDoc(userRef, userData);

        // Save the information that can be shown on the public profile
        const profileRef = doc(db, "profiles", user.uid);

        let goal = "";

        if (showupcheck.checked) {
            goal += "Show Up";
        }

        if (improvehealthcheck.checked) {
            if (goal !== "") {
                goal += ", ";
            }

            goal += "Improve my health";
        }

        if (supportcommunitycheck.checked) {
            if (goal !== "") {
                goal += ", ";
            }

            goal += "Support my community";
        }

        if (otherreasoncheck.checked) {
            if (goal !== "") {
                goal += ", ";
            }

            goal += "Other";
        }

        await setDoc(
            profileRef,
            {
                showUp: showupcheck.checked,
                improveHealth: improvehealthcheck.checked,
                supportCommunity: supportcommunitycheck.checked,
                otherReason: otherreasoncheck.checked,
                goal: goal,
            },
            { merge: true },
        );

        window.location.href = "index-all-set-page.html";
    } catch (error) {
        console.error(error);
        customAlert(error.message);
    }
});
