import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
    authDomain: "testing-database-c0a2c.firebaseapp.com",
    projectId: "testing-database-c0a2c",
    storageBucket: "testing-database-c0a2c.firebasestorage.app",
    messagingSenderId: "879740645963",
    appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
    measurementId: "G-TVHDNT78JT",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get the UID selected from the search page
const profileUID = sessionStorage.getItem("profileUID");

console.log("Profile UID:", profileUID);

let username = "";
let displayUsername = "";

// HTML elements
const profile = document.getElementById("img-profile");
const usernameText = document.getElementById("username-details");
const locationText = document.getElementById("location-details");
const yourReasonText = document.getElementById("why-container");
const dayNumberSwumText = document.getElementById("days-swum");
const myTotalDistanceText = document.getElementById("total-distance");
const myTotalHoursText = document.getElementById("total-hours");
const goalSelectionText = document.getElementById("goal");
const myAgeText = document.getElementById("age");
const myGenderText = document.getElementById("gender");

const expText = document.getElementById("exp");
const levelText = document.getElementById("level");
const streakText = document.getElementById("streak");
// Load the profile
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("User is not signed in.");
        return;
    }

    if (!profileUID) {
        console.log("No profile was selected.");
        return;
    }

    try {
        // Get the selected user's PUBLIC profile
        const profileRef = doc(db, "profiles", profileUID);
        const profileSnapshot = await getDoc(profileRef);

        if (!profileSnapshot.exists()) {
            console.log("Profile does not exist.");
            return;
        }

        const profileData = profileSnapshot.data();

        // Profile picture
        profile.src = profileData.pfpUrl || "profile-picture.png";

        // Username
        username = profileData.username || "Anonymous";
        displayUsername = username.charAt(0).toUpperCase() + username.substr(1);
        usernameText.textContent = displayUsername;

        // Location
        if (profileData.location) {
            locationText.textContent = "🍁 " + profileData.location + ", Canada";
        } else {
            locationText.textContent = "N/A";
        }

        // Their Why
        if (profileData.profilePublic === true) {
            yourReasonText.value = profileData.myReason || "N/A";
        } else {
            yourReasonText.value = "Private";
        }

        // Days swum
        dayNumberSwumText.value = profileData.daysSwum || 0;

        // Total distance
        myTotalDistanceText.value = Number(profileData.totalDistance || 0).toFixed(1);

        // Total duration
        myTotalHoursText.value = Number(profileData.totalDuration || 0).toFixed(1);

        // Goal
        goalSelectionText.value = profileData.goal || "N/A";

        // Age
        myAgeText.value = profileData.age || "N/A";

        // Gender
        myGenderText.value = profileData.gender || "N/A";

        // EXP
        expText.value = profileData.exp || 0;

        // Level
        levelText.value = profileData.level || 0;

        // Streak
        streakText.value = profileData.streak || 0;
    } catch (error) {
        console.error("Error fetching profile data:", error);
    }
});

// Back button
let back = document.getElementById("back");

back.addEventListener("click", () => {
    window.location.href = "index-search-page.html";
});

let following = document.getElementById("following-label");
let followers = document.getElementById("followers-label");

function callFollowingList() {
    window.location.href = "index-following-list-page.html";
}

function callFollowersList() {
    window.location.href = "index-followers-list-page.html";
}

following.addEventListener("click", callFollowingList);
followers.addEventListener("click", callFollowersList);
