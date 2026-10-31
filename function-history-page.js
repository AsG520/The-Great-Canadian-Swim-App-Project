import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

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

// HTML elements
const optionDetails = document.getElementById("option-details");
const distance = document.getElementById("distance");
const distanceUnit = document.getElementById("distance-unit");
const time = document.getElementById("time");
const timeUnit = document.getElementById("time-unit");
const submissionButton = document.getElementById("save-swim");

// Get today's date using the user's local time
function getTodayDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

// Get a date a certain number of days before today
function getDateDaysAgo(daysAgo) {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

// Determine which date the user selected
function getSelectedDate() {
  if (optionDetails.value === "Yesterday") {
    return getDateDaysAgo(1);
  }

  if (optionDetails.value === "Day Before Yesterday") {
    return getDateDaysAgo(2);
  }

  return null;
}

// Load the selected day's activity
async function loadHistory() {
  const user = auth.currentUser;

  if (!user) {
    console.log("No authenticated user.");
    return;
  }

  const selectedDate = getSelectedDate();

  if (!selectedDate) {
    return;
  }

  const activityRef = doc(db, "users", user.uid, "activity", selectedDate);

  try {
    const activitySnap = await getDoc(activityRef);

    const activityData = activitySnap.data();

    // Get the saved distance
    let distanceEntered = activityData.distance || 0;

    // Convert kilometres into metres if selected
    if (distanceUnit.value === "Meters") {
      distanceEntered = distanceEntered * 1000;
    }

    distance.value = distanceEntered;

    // Get the saved duration
    let timeEntered = activityData.duration || 0;

    // Convert hours into minutes if selected
    if (timeUnit.value === "Minutes") {
      timeEntered = timeEntered * 60;
    }

    time.value = timeEntered;

    console.log("Loaded history for:", selectedDate);
    console.log("Sessions:", activityData.sessions || 0);
  } catch (error) {
    console.error("Error loading history:", error);

    alert("Unable to load your swim history.");
  }
}

// When user selects a date
optionDetails.addEventListener("change", loadHistory);

// Reload history when the distance unit changes
distanceUnit.addEventListener("change", loadHistory);

// Reload history when the time unit changes
timeUnit.addEventListener("change", loadHistory);

// Check if user is signed in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.log("No authenticated user.");
    return;
  }

  console.log("User signed in:", user.uid);
});

// Save changes or add a past swim
submissionButton.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be signed in.");
    return;
  }

  const selectedDate = getSelectedDate();

  if (!selectedDate) {
    alert("Please select a date first.");
    return;
  }

  // Get the distance entered by the user
  let distanceEntered = Number(distance.value);

  // Check whether the user entered a valid distance
  if (distance.value === "" || isNaN(distanceEntered) || distanceEntered <= 0) {
    alert("Please enter a valid distance.");
    return;
  }

  // Convert the distance into kilometres
  if (distanceUnit.value === "Meters") {
    distanceEntered = distanceEntered / 1000;
  }

  // Get the time entered by the user
  let timeEntered = Number(time.value);

  // Check whether the user entered a valid time
  if (time.value === "" || isNaN(timeEntered) || timeEntered <= 0) {
    alert("Please enter a valid swimming duration.");
    return;
  }

  // Convert the selected time unit into hours
  if (timeUnit.value === "Minutes") {
    timeEntered = timeEntered / 60;
  }

  // Firestore references
  const activityRef = doc(db, "users", user.uid, "activity", selectedDate);

  const userRef = doc(db, "users", user.uid);

  const profileRef = doc(db, "profiles", user.uid);

  const communityRef = doc(db, "community", "totals");

  try {
    // Check if this day already has an activity
    const activitySnap = await getDoc(activityRef);

    if (!activitySnap.exists()) {
      // Create a new past activity
      await setDoc(activityRef, {
        date: selectedDate,
        distance: distanceEntered,
        duration: timeEntered,
        sessions: 1,
        trying: true,
      });

      // Increase user's totals
      await updateDoc(userRef, {
        myDistance: increment(distanceEntered),
        myHours: increment(timeEntered),
        mySessions: increment(1),
      });

      // Increase profile totals
      await updateDoc(profileRef, {
        totalDistance: increment(distanceEntered),
        totalDuration: increment(timeEntered),
        daysSwum: increment(1),
      });

      // Increase community totals
      await updateDoc(communityRef, {
        totalDistance: increment(distanceEntered),
        totalHours: increment(timeEntered),
        totalSessions: increment(1),
        lastUpdated: serverTimestamp(),
      });

      alert("Your past swim was added!");

      return;
    }

    const oldActivityData = activitySnap.data();
    // Get the existing distance and duration
    const oldDistance = oldActivityData.distance || 0;
    const oldDuration = oldActivityData.duration || 0;
    // Add the new swim to the existing history
    const newTotalDistance = oldDistance + distanceEntered;
    const newTotalDuration = oldDuration + timeEntered;
    // Add the new swim to the existing activity
    await updateDoc(activityRef, {
      distance: newTotalDistance,
      duration: newTotalDuration,
      sessions: increment(1),
    });
    // Increase user's totals
    await updateDoc(userRef, {
      myDistance: increment(distanceEntered),
      myHours: increment(timeEntered),
      mySessions: increment(1),
    });
    // Increase profile totals
    await updateDoc(profileRef, {
      totalDistance: increment(distanceEntered),
      totalDuration: increment(timeEntered),
    });
    // Increase community totals
    await updateDoc(communityRef, {
      totalDistance: increment(distanceEntered),
      totalHours: increment(timeEntered),
      totalSessions: increment(1),
      lastUpdated: serverTimestamp(),
    });
    alert("Your new swim was added to your history!");
  } catch (error) {
    console.error("Error updating history:", error);

    alert("Unable to update your swim history.");
  }
});
