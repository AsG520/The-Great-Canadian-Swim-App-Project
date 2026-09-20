import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

import {
  getFirestore,
  getDoc,
  doc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
  authDomain: "testing-database-c0a2c.firebaseapp.com",
  projectId: "testing-database-c0a2c",
  storageBucket: "testing-database-c0a2c.firebasestorage.app",
  messagingSenderId: "879740645963",
  appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
  measurementId: "G-TVHDNT78JT",
};

// Connect to Firebase
const app = initializeApp(firebaseConfig);

// Start Firebase Authentication
const auth = getAuth(app);

// Start Firestore
const db = getFirestore(app);

// HTML elements
const profiles = document.getElementById("profiles");
const back = document.getElementById("back");

let username = "";
let displayUsername = "";

// Get the profile card template
const template = document.getElementById("profile-template");

// Wait for Firebase to find the signed-in user
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("No user is signed in.");
    return;
  }

  console.log("Signed-in user:", user.uid);

  // Get the profile UID that was selected on the previous page
  const profileUID = sessionStorage.getItem("profileUID");

  // Make sure a profile was selected
  if (!profileUID) {
    console.log("No profile was selected.");
    return;
  }

  // Load that person's following
  await loadFollowing(profileUID);
});

// Load users that the current user follows
async function loadFollowing(currentUserUID) {
  try {
    // Get the current user's following collection
    const followingRef = collection(
      db,
      "profiles",
      currentUserUID,
      "following",
    );

    // Get all following documents
    const followingSnapshot = await getDocs(followingRef);

    // Remove any cards already on the page
    profiles.innerHTML = "";

    // Check if the user follows nobody
    if (followingSnapshot.empty) {
      profiles.textContent = "Not following anyone yet.";

      return;
    }

    // Go through every following document
    for (const followingDoc of followingSnapshot.docs) {
      // Get the UID of the person being followed
      const followingUID = followingDoc.data().userId;

      console.log("Following UID:", followingUID);

      // Get that person's public profile
      const profileRef = doc(db, "profiles", followingUID);

      const profileSnapshot = await getDoc(profileRef);

      // Make sure their profile exists
      if (!profileSnapshot.exists()) {
        console.log("Profile does not exist:", followingUID);
        continue;
      }

      // Get profile information
      const data = profileSnapshot.data();

      // Copy the card template
      const card = template.content.cloneNode(true);

      // Get parts of the card
      const profileCard = card.querySelector(".profile-card");
      const profilePfp = card.querySelector(".profile-pfp");
      const profileUsername = card.querySelector(".profile-username");
      const profileDetails = card.querySelector(".profile-details");

      // Give the card a page to go to
      profileCard.href = "index-user-profile-page.html";

      // Save the person's UID when clicked
      profileCard.addEventListener("click", () => {
        sessionStorage.setItem("profileUID", followingUID);
      });

      // Profile picture
      profilePfp.src = data.pfpUrl || "profile-picture.png";

      // Username
       username = data.username;
     displayUsername = username.charAt(0).toUpperCase() + username.substr(1);
    profileUsername.textContent = displayUsername;
    
      // Age and gender
      profileDetails.textContent =
        (data.age || "N/A") + " | " + (data.gender || "N/A");

      // Add the card to the page
      profiles.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading following:", error);

    profiles.textContent = "Unable to load following.";
  }
}

// Back button
back.addEventListener("click", () => {
  // Go back to the profile page
  window.location.href = "index-search-page.html";
});
