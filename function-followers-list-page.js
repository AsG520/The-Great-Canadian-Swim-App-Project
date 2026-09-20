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

// Get the template
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

  // Load that person's followers
  await loadFollowers(profileUID);
});

// Load followers
async function loadFollowers(currentUserUID) {
  try {
    // Get the current user's followers collection
    const followersRef = collection(
      db,
      "profiles",
      currentUserUID,
      "followers",
    );

    // Get all follower documents
    const followersSnapshot = await getDocs(followersRef);

    // Remove any cards already on the page
    profiles.innerHTML = "";

    // Check if there are no followers
    if (followersSnapshot.empty) {
      profiles.textContent = "No followers yet.";

      return;
    }

    // Go through every follower
    for (const followerDoc of followersSnapshot.docs) {
      // Get the follower's UID
      // Get the follower's UID
      const followerData = followerDoc.data();

      let followerUID = followerData.userId;

      // If userId is missing, use the follower document ID
      if (!followerUID) {
        followerUID = followerDoc.id;
      }
      console.log("Follower UID:", followerUID);

      // Get the follower's public profile
      const profileRef = doc(db, "profiles", followerUID);

      const profileSnapshot = await getDoc(profileRef);

      // Make sure the profile exists
      if (!profileSnapshot.exists()) {
        console.log("Profile does not exist:", followerUID);
        continue;
      }

      // Get profile information
      const data = profileSnapshot.data();

      // Show the information in the console
      console.log("Follower UID:", followerUID);
      console.log("Follower profile data:", JSON.stringify(data, null, 2));

      // Copy the template
      const card = template.content.cloneNode(true);

      // Get parts of the card
      const profileCard = card.querySelector(".profile-card");
      const profilePfp = card.querySelector(".profile-pfp");
      const profileUsername = card.querySelector(".profile-username");
      const profileDetails = card.querySelector(".profile-details");

      // Give the card a page to go to
      profileCard.href = "index-user-profile-page.html";

      // Save the UID when the card is clicked
      profileCard.addEventListener("click", () => {
        sessionStorage.setItem("profileUID", followerUID);
      });

      // Add profile picture
      profilePfp.src = data.pfpUrl || "profile-picture.png";

      // Add username
       username = data.username;
     displayUsername = username.charAt(0).toUpperCase() + username.substr(1);
    profileUsername.textContent = displayUsername;
    
      // Add age and gender
      profileDetails.textContent =
        (data.age || "N/A") + " | " + (data.gender || "N/A");

      // Put card onto page
      profiles.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading followers:", error);

    profiles.textContent = "Unable to load followers.";
  }
}

// Back button
back.addEventListener("click", () => {
  // Go back to the profile page
  window.location.href = "index-search-page.html";
});
