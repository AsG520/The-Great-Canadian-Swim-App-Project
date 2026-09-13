// Basically, gets the values that the user puts in (e.g. username, age, gender, etc) it forces them to insert input and storages information into the fire store.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
    authDomain: "testing-database-c0a2c.firebaseapp.com",
    projectId: "testing-database-c0a2c",
    storageBucket: "testing-database-c0a2c.firebasestorage.app",
    messagingSenderId: "879740645963",
    appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

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

// https://www.javascriptroom.com/blog/not-allow-a-blank-character-space-in-a-input-form/
// 3.2 JavaScript Validation: Fine-Grained Control# and a bit of 3.2.3 Combine Both: Prevent and Clean Up#
const usernameInput = document.getElementById("username");

let usernameAvailable = false;
let unsubscribeUsername = null;

usernameInput.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        // Check if the pressed key is a space
        e.preventDefault(); // Block the space
    }
});
// Prevents spacing when copy/paste
usernameInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\s/g, "");

    const username = e.target.value.trim().toLowerCase();
    // Stop listening to the previous username
    if (unsubscribeUsername) {
        unsubscribeUsername();
    }

    usernameAvailable = false;

    if (username === "") {
        return;
    }

    const q = query(collection(db, "profiles"), where("username", "==", username));

    unsubscribeUsername = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            usernameAvailable = true;
            console.log("Username available");
        } else {
            usernameAvailable = false;
            console.log("Username taken");
        }
    });
});

const submit = document.getElementById("submit");

submit.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim().toLowerCase();
    const age = document.getElementById("age-number").value.trim();
    const location = document.getElementById("location-details").value;
    const gender = document.getElementById("gender-details").value;
    const height = document.getElementById("height-details").value.trim();
    const weight = document.getElementById("weight-details").value.trim();

    // Make sure every field is filled in
    if (username === "" || age === "" || height === "" || weight === "" || !gender || !location) {
        customAlert("Please fill out all information before continuing.");
        return;
    }

    if (!usernameAvailable) {
        customAlert("Username is taken or still being checked.");
        return;
    }
    // Gets logged in user UID
    const user = auth.currentUser;

    if (!user) {
        customAlert("You must be signed in.");
        return;
    }

    //const userID = localStorage.getItem("loggedInUserId");
    const userData = {
        username: username,
        age: age,
        location: location,
        gender: gender,
        height: height,
        weight: weight,
        credentialsCompleted: true,
    };

    const userRef = doc(db, "users", user.uid);
    const profileRef = doc(db, "profiles", user.uid);

    try {
        console.log("Current user:", auth.currentUser);
        console.log("Auth UID:", auth.currentUser?.uid);
        await updateDoc(userRef, userData);

        // Update public profile
        await setDoc(
            profileRef,
            {
                username: username,
                age: age,
                location: location,
                gender: gender,
            },
            { merge: true },
        );

        window.location.href = "index-about-you-page.html";
    } catch (error) {
        console.error(error);
        customAlert(error.message);
    }
});
