// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// Import Firestore and functions used to access and update user data within
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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
const submit = document.getElementById("continue");

// When clicking the submit button this runs
submit.addEventListener("click", async () => {
    // Gets user's entered in details (with no spaces {.trim()} )
    const disabilityCheckbox = document.getElementById("disability-checkbox");
    const parentCheckbox = document.getElementById("parent-caregiver-checkbox");
    const supportCheckbox = document.getElementById("supporter-checkbox");
    const clubCheckbox = document.getElementById("club-coach-checkbox");
    const educationCheckbox = document.getElementById("education-checkbox");
    const organizationCheckbox = document.getElementById("organization-checkbox");

    // Make sure every field is filled in
    if (!disabilityCheckbox.checked && !parentCheckbox.checked && !supportCheckbox.checked && !clubCheckbox.checked && !educationCheckbox.checked && !organizationCheckbox.checked) {
        customAlert("Please select at least one option before continuing.");
        return;
    }
    // Stores user data in a document
    const userData = {
        disability: disabilityCheckbox.checked,
        parentCaregiver: parentCheckbox.checked,
        supporter: supportCheckbox.checked,
        clubCoach: clubCheckbox.checked,
        education: educationCheckbox.checked,
        organization: organizationCheckbox.checked,
        aboutYouCompleted: true, // Sets value to ture to save that the user has filled out the credentials page
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

        window.location.href = "index-reason-swimming-page.html";
    } catch (error) {
        console.error(error);
        customAlert(error.message);
    }
});
