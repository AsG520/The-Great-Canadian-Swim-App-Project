import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

import { getFirestore, getDoc, doc,setDoc,deleteDoc, collection, getCountFromServer, } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

const followersCount = document.getElementById("followers-count");
const followingCount = document.getElementById("following-count");
const followButton = document.getElementById("follow-and-unfollow-selection");
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

        await loadFollowCounts();

    await checkIfFollowing(user); // Check if the current user is following this profile
    } catch (error) {
        console.error("Error fetching profile data:", error);
    }
});

// Load the number of followers and following
async function loadFollowCounts() {
  try {
    // Selected user's followers collection
    const followersRef = collection(db, "profiles", profileUID, "followers");
    // Selected user's following collection
    const followingRef = collection(db, "profiles", profileUID, "following");
    // Count the documents in both collections
    const followersSnapshot = await getCountFromServer(followersRef);
    const followingSnapshot = await getCountFromServer(followingRef);
    // Put the numbers into the HTML
    followersCount.textContent = followersSnapshot.data().count;
    followingCount.textContent = followingSnapshot.data().count;
    console.log("Followers:", followersSnapshot.data().count);
    console.log("Following:", followingSnapshot.data().count);
  } catch (error) {
    console.error("Error loading follow counts:", error);
    followersCount.textContent = "0";
    followingCount.textContent = "0";
  }
}

// Back button
let back = document.getElementById("back");

back.addEventListener("click", () => {
    window.location.href = "index-search-page.html";
});

// Check if the current user is already following this profile
async function checkIfFollowing(currentUser) {
  // You cannot follow yourself
  if (currentUser.uid === profileUID) {
    followButton.style.display = "none";
    return;
  }

  // Find the current user's following document
  const followingRef = doc(
    db,
    "profiles",
    currentUser.uid,
    "following",
    profileUID,
  );

  const followingSnapshot = await getDoc(followingRef);

  // Change the dropdown depending on whether they are following
  if (followingSnapshot.exists()) {
    followButton.value = "Follow";
  } else {
    followButton.value = "Unfollow";
  }
}

// Follow or unfollow when the dropdown changes
followButton.addEventListener("change", async () => {
  // Get the person currently signed in
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.log("No user is signed in.");
    return;
  }

  // You cannot follow yourself
  if (currentUser.uid === profileUID) {
    console.log("You cannot follow yourself.");
    return;
  }

  const selectedOption = followButton.value;

  // FOLLOW
  if (selectedOption === "Follow") {
    // Add the selected profile to MY following list
    const followingRef = doc(
      db,
      "profiles",
      currentUser.uid,
      "following",
      profileUID,
    );

    // Add ME to the selected profile's followers list
    const followerRef = doc(
      db,
      "profiles",
      profileUID,
      "followers",
      currentUser.uid,
    );

    await setDoc(followingRef, {
      userId: profileUID,
    });

    await setDoc(followerRef, {
      userId: currentUser.uid,
    });

    console.log("Followed user!");
    // Check the actual status again
    await checkIfFollowing(currentUser);

    // Update the follower/following counts
    await loadFollowCounts();
  }

  // UNFOLLOW
  if (selectedOption === "Unfollow") {
    // Remove the selected profile from MY following list
    const followingRef = doc(
      db,
      "profiles",
      currentUser.uid,
      "following",
      profileUID,
    );

    // Remove ME from the selected profile's followers list
    const followerRef = doc(
      db,
      "profiles",
      profileUID,
      "followers",
      currentUser.uid,
    );

    await deleteDoc(followingRef);
    await deleteDoc(followerRef);

    console.log("Unfollowed user!");
    // Check the actual status again
    await checkIfFollowing(currentUser);

    // Update the follower/following counts
    await loadFollowCounts();
  }
});

const following = document.getElementById("following-label");
const followers = document.getElementById("followers-label");
// Open the following list for the profile being viewed
following.addEventListener("click", () => {
  // Save the UID of the profile being viewed
  sessionStorage.setItem("listProfileUID", profileUID);
  // Open following page
  window.location.href = "index-following-list-page.html";
});
// Open the followers list for the profile being viewed
followers.addEventListener("click", () => {
  // Save the UID of the profile being viewed
  sessionStorage.setItem("listProfileUID", profileUID);
  // Open followers page
  window.location.href = "index-followers-list-page.html";
});
