import { getFirestore, doc, getDoc, updateDoc, setDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
const time = document.getElementById("time");
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

// Clear the inputs
function clearInputs() {
    distance.value = "";
    time.value = "";
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

        // If there is no activity, leave the inputs empty
        // so the user can add a past swim.
        if (!activitySnap.exists()) {
            clearInputs();

            console.log("No swim recorded for:", selectedDate, "- user can add one.");

            return;
        }

        const activityData = activitySnap.data();

        // Firestore stores distance in kilometres.
        // The input uses metres.
        if (activityData.distance) {
            distance.value = activityData.distance * 1000;
        } else {
            distance.value = "";
        }

        // Firestore stores duration in hours.
        // The input uses minutes.
        if (activityData.duration) {
            time.value = activityData.duration * 60;
        } else {
            time.value = "";
        }
        console.log("Loaded history for:", selectedDate);
        console.log("Sessions:", activityData.sessions || 0);
    } catch (error) {
        console.error("Error loading history:", error);

        alert("Unable to load your swim history.");
    }
}

// When user selects a date
optionDetails.addEventListener("change", loadHistory);

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

    // Convert metres → kilometres
    const distanceEntered = Number(distance.value) / 1000;

    if (isNaN(distanceEntered) || distanceEntered <= 0) {
        alert("Please enter a valid distance.");
        return;
    }

    // Convert minutes → hours
    const timeEntered = Number(time.value) / 60;

    if (isNaN(timeEntered) || timeEntered <= 0) {
        alert("Please enter a valid number of minutes.");
        return;
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

            clearInputs();

            return;
        }

        const oldActivityData = activitySnap.data();

        const oldDistance = oldActivityData.distance || 0;
        const oldDuration = oldActivityData.duration || 0;

        // Calculate the difference
        const distanceDifference = distanceEntered - oldDistance;

        const durationDifference = timeEntered - oldDuration;

        // Keep the existing session count.
        // Editing the day's swim, not adding another session.
        await updateDoc(activityRef, {
            distance: distanceEntered,
            duration: timeEntered,
        });

        // Update user totals by the difference
        await updateDoc(userRef, {
            myDistance: increment(distanceDifference),
            myHours: increment(durationDifference),
        });

        // Update profile totals by the difference
        await updateDoc(profileRef, {
            totalDistance: increment(distanceDifference),
            totalDuration: increment(durationDifference),
        });

        // Update community totals by the difference
        await updateDoc(communityRef, {
            totalDistance: increment(distanceDifference),
            totalHours: increment(durationDifference),
            lastUpdated: serverTimestamp(),
        });

        alert("Your swim history was updated!");
    } catch (error) {
        console.error("Error updating history:", error);

        alert("Unable to update your swim history.");
    }
});
