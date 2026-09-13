let settings = document.getElementById("settings-box");

function callSettingsPage() {
    window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);

import { getFirestore, doc, getDoc, updateDoc, increment, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
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

const distance = document.getElementById("distance"); // (meters)
const time = document.getElementById("time"); // (minutes)
const great = document.getElementById("great");
const good = document.getElementById("good");
const okay = document.getElementById("okay");
const tough = document.getElementById("tough");
// When the enter button on homepage.html is click this runs

const pool = document.getElementById("pool");
const openwater = document.getElementById("open-water");
const notes = document.getElementById("notes");

// local time for user data (based on device time)
function getTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}
// UTC time for all users (For community totals)
function getUTCDate() {
    const date = new Date();

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

const submissionButton = document.getElementById("save-swim");

submissionButton.addEventListener("click", async () => {
    let expIncrease = 0;
    // Takes distance value entered by user

    const distanceEntered = Number(distance.value) / 1000; // convert to km
    if (isNaN(distanceEntered) || distanceEntered <= 0) {
        alert("Please enter a valid distance.");
        return;
    }
    const timeEntered = Number(time.value) / 60; //convert to hours
    if (isNaN(timeEntered) || timeEntered <= 0) {
        alert("Please enter a valid number of minutes.");
        return;
    }

    const timeInMinutes = timeEntered * 60;

    if (0 < distanceEntered && 0.5 >= distanceEntered) {
        expIncrease += 100;
    } else if (0.5 < distanceEntered && 1 >= distanceEntered) {
        expIncrease += 500;
    } else if (1 < distanceEntered && 5 >= distanceEntered) {
        expIncrease += 900;
    } else if (distanceEntered > 5) {
        expIncrease += 1300;
    }

    if (0 < timeInMinutes && 30 >= timeInMinutes) {
        expIncrease += 50;
    } else if (30 < timeInMinutes && 60 >= timeInMinutes) {
        expIncrease += 90;
    } else if (60 < timeInMinutes && 90 >= timeInMinutes) {
        expIncrease += 130;
    } else if (90 < timeInMinutes && 120 >= timeInMinutes) {
        expIncrease += 170;
    } else if (120 < timeInMinutes && 160 >= timeInMinutes) {
        expIncrease += 210;
    }
    if (!great.checked && !good.checked && !okay.checked && !tough.checked) {
        alert("Please select at least one feeling before continuing.");
        return;
    }
    if (!pool.checked && !openwater.checked) {
        alert("Please select at least one location before continuing.");
        return;
    }

    // Gets the logged in user's ID
    const user = auth.currentUser;

    if (!user) {
        console.log("No authenticated user.");
        return;
    }

    const today = getTodayDate();

    const activityRef = doc(db, "users", user.uid, "activity", today);

    const userRef = doc(db, "users", user.uid);
    const profileRef = doc(db, "profiles", user.uid);
    // Update the community totals for all users.
    const communityRef = doc(db, "community", "totals");

    try {
        const activitySnap = await getDoc(activityRef);

        //if first swim of the day
        if (!activitySnap.exists()) {
            await setDoc(activityRef, {
                date: today,
                distance: distanceEntered,
                duration: timeEntered,
                sessions: 1,
                trying: true,
            });
            await updateDoc(profileRef, {
                totalDistance: distanceEntered,
                totalDuration: timeEntered,
            });
        } else {
            // increase the distance, duration, and sessions for the day if the user has already logged a swim today
            await updateDoc(activityRef, {
                distance: increment(distanceEntered),
                duration: increment(timeEntered),
                sessions: increment(1),
                trying: true,
            });
            await updateDoc(profileRef, {
                totalDistance: increment(distanceEntered),
                totalDuration: increment(timeEntered),
            });
        }
        // Get user's main document
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const todayDate = getTodayDate();

        const lastStreakDate = userData.lastStreakDate || "";
        const currentStreak = userData.streak || 0;

        if (lastStreakDate !== todayDate) {
            let newStreak = 1;

            if (lastStreakDate) {
                const lastDate = new Date(lastStreakDate + "T00:00:00");
                const today = new Date(todayDate + "T00:00:00");

                const difference = (today - lastDate) / (1000 * 60 * 60 * 24);

                if (difference === 1) {
                    newStreak = currentStreak + 1;
                }
            }

            await updateDoc(userRef, {
                streak: newStreak,
                lastStreakDate: todayDate,
            });
        }

        const newExp = (userData.exp || 0) + expIncrease;

        await updateDoc(userRef, {
            myDistance: increment(distanceEntered),
            myHours: increment(timeEntered),
            mySessions: increment(1),
            exp: newExp,
            level: Math.floor(newExp / 5000),
        });

        // Give credit for today only once.
        // A swim counts as "Trying / Yes".
        if (userData.lastCompletedDay !== today) {
            await updateDoc(userRef, {
                completedDays: increment(1),
                lastCompletedDay: today,
            });

            await updateDoc(profileRef, {
                daysSwum: increment(1),
            });
        }

        // Update community totals
        const communitySnap = await getDoc(communityRef);
        const communityData = communitySnap.data();
        const utcDate = getUTCDate();

        const communityUpdate = {
            totalDistance: increment(distanceEntered),
            totalHours: increment(timeEntered),
            totalSessions: increment(1),
            lastUpdated: serverTimestamp(),
        };

        if (!communityData.utcDate || communityData.utcDate !== utcDate) {
            communityUpdate.utcTodayDistance = distanceEntered;
            communityUpdate.utcTodayHours = timeEntered;
            communityUpdate.utcTodaySessions = 1;
            communityUpdate.utcDate = utcDate;
        } else {
            communityUpdate.utcTodayDistance = increment(distanceEntered);
            communityUpdate.utcTodayHours = increment(timeEntered);
            communityUpdate.utcTodaySessions = increment(1);
        }

        await updateDoc(communityRef, communityUpdate);
        // Adds the distance added to the total distance
        // Clear the input box after saving.
        distance.value = "";
        time.value = "";
        notes.value = "";

        great.checked = false;
        good.checked = false;
        okay.checked = false;
        tough.checked = false;

        pool.checked = false;
        openwater.checked = false;

        window.location.href = "index-great-swim-page.html";
    } catch (error) {
        console.error(error);
        alert("Unable to save your workout.");
    }
});
