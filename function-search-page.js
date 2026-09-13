let settings = document.getElementById("settings-box");

function callSettingsPage() {
    window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js"; // Imports firebase connection tools
import { getFirestore, setDoc, updateDoc, doc, getDoc, collection, query, where, getDocs, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"; // connects to Firebase's database, Firebase stores UID, Email and password, while Firestore holds other info
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
// Imports Firebase Authentication functions used to create accounts, sign users in, sign in with Google, and reset passwords.

const firebaseConfig = {
    // Identifies firebase project to link to
    apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
    authDomain: "testing-database-c0a2c.firebaseapp.com",
    projectId: "testing-database-c0a2c",
    storageBucket: "testing-database-c0a2c.firebasestorage.app",
    messagingSenderId: "879740645963",
    appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
    measurementId: "G-TVHDNT78JT",
    //WATCH THIS VIDEO TO LEARN WHAT TO PUT HERE   https://youtu.be/_Xczf06n6x0
};
// Initialize Firebase

// connects website to Firebase
const app = initializeApp(firebaseConfig);
// Starts Firevase Authentication
const auth = getAuth(app);
// Starts Firestore Database
const db = getFirestore(app);

const searchBox = document.getElementById("search-bar");

const video1 = document.getElementById("video1");
const video2 = document.getElementById("video2");
const video3 = document.getElementById("video3");
const video4 = document.getElementById("video4");

let username = "";
let displayUsername = "";

const profiles = document.getElementById("profiles");
profiles.style.display = "none";

let unsubscribe = null;

// Prevent spaces when typing
searchBox.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        e.preventDefault();
    }
});

// Prevent spaces when copy/pasting
searchBox.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\s/g, "").toLowerCase();

    const value = e.target.value.toLowerCase();

    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    // https://www.w3schools.com/howto/howto_js_toggle_hide_show.asp
    if (value === "") {
        video1.style.display = "block";
        video2.style.display = "block";
        video3.style.display = "block";
        video4.style.display = "block";
        profiles.style.display = "none";
    } else {
        video1.style.display = "none";
        video2.style.display = "none";
        video3.style.display = "none";
        video4.style.display = "none";
        profiles.style.display = "block";
    }

    console.log("Current search value:", value);

    if (value.length > 0) {
        // replace this with search/filter logic
        // https://firebase.google.com/docs/firestore/query-data/listen#web_8
        console.log("User typed something!");
        const q = query(
            collection(db, "profiles"),
            // https://stackoverflow.com/questions/46573804/firestore-query-documents-startswith-a-string?utm_source, use control f and type: I found this, which works perfectly for startsWith

            where("username", ">=", value),
            where("username", "<=", value + "\uf8ff"),
        );

        unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                console.log("Matching usernames:");

                profiles.innerHTML = "";

                const template = document.getElementById("profile-template");

                querySnapshot.forEach((doc) => {
                    const data = doc.data();

                    /*  // Only show public profiles
          if (data.profilePublic !== true) {
            return;
          }*/

                    const card = template.content.cloneNode(true); // Copies the template in html and takes all content in it, allowing for js to access elements inside

                    const profileCard = card.querySelector(".profile-card");
                    const profilePfp = card.querySelector(".profile-pfp");
                    const profileUsername = card.querySelector(".profile-username");
                    const profileDetails = card.querySelector(".profile-details");

                    //Gives the hyperlink (<a>) a link/page to go to
                    profileCard.href = "index-user-profile-page.html";

                    //Saves UID when card is clicked so next page (index-profile-page.html) has the user's info
                    profileCard.addEventListener("click", () => {
                        sessionStorage.setItem("profileUID", doc.id); // Saves the UID into the browser's session storage
                    });
                    profilePfp.src = data.pfpUrl || "profile-picture.png"; // Provides the users profile image on the card or if they don't have one add the default picture

                    username = data.username;
                    displayUsername = username.charAt(0).toUpperCase() + username.substr(1);
                    profileUsername.textContent = displayUsername;

                    profileDetails.textContent = data.age + " | " + data.gender;

                    profiles.appendChild(card); //Puts the created card into the HTML element named "profiles"

                    console.log(data.username);
                    console.log(data.gender);
                    console.log(data.age);
                    console.log(data.daysSwum);
                    console.log(data.location);
                    console.log(data.profilePublic);
                    console.log(data.age);
                    console.log(data.totalDistance);
                    console.log(data.totalDuration);

                    if (data.profilePublic == true) {
                        console.log(data.myReason);
                    }
                });
            },
            (error) => {
                console.error("Firestore snapshot error:", error);
            },
        );
    }
});
