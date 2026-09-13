let settings = document.getElementById("settings-box");

function callSettingsPage() {
    window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js"; /* connect to firebase*/
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js"; /* Creates the authentication system. watches whether a user is logged in or logged out. Logs the user out. */
import { getFirestore, onSnapshot, getDoc, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"; /* Firestore is where you store user data.*/

const firebaseConfig = {
    /* firebase project to connect to*/
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
const app = initializeApp(firebaseConfig); // connects firebase to website*/
// Create authentication and database connections
const auth = getAuth(app); // login,signup, logout and current user
const db = getFirestore(app); // data, saving data and updating data
let userLoaded = false;

let completedDays = 0;
let myDistance = "";
let myTime = "";
let mySessions = "";
let communityDistance = "";
let communityTime = "";
let communitySessions = "";

let todayDistance = 0;
let todayTime = 0;
let todaySessions = 0;

let communityTodayDistance = 0;
let communityTodayTime = 0;
let communityTodaySessions = 0;

const dayNumberText = document.getElementById("dayNumber");
const myDistanceText = document.querySelectorAll(".distance-number");
const myTimeText = document.querySelectorAll(".active-duration-number");
const mySessionsText = document.querySelectorAll(".session-number");

const todayDistanceText = document.getElementById("total-distance");
const todayTimeText = document.getElementById("total-time");
const todaySessionsText = document.getElementById("total-sessions");
const communityDistanceText = document.getElementById("total-community-distance");
const communityTimeText = document.getElementById("total-community-time");
const communitySessionsText = document.getElementById("total-community-sessions");

const communityTodayDistanceText = document.getElementById("today-community-distance");
const communityTodayTimeText = document.getElementById("today-community-time");
const communityTodaySessionsText = document.getElementById("today-community-sessions");
onAuthStateChanged(auth, (user) => {
    if (user) {
        // checks if user exist, otherwise no document is found in local storage
        const userRef = doc(db, "users", user.uid);

        onSnapshot(
            userRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    // Checks if document exists
                    const userData = docSnap.data();
                    //  document.getElementById("loggedUserFName").innerText =
                    //       userData.username;
                    myDistance = userData.myDistance;
                    for (let i = 0; i < myDistanceText.length; i++) {
                        myDistanceText[i].value = myDistance.toFixed(1);
                    }
                    myTime = userData.myHours;
                    for (let i = 0; i < myTimeText.length; i++) {
                        myTimeText[i].value = myTime.toFixed(1);
                    }
                    mySessions = userData.mySessions;
                    for (let i = 0; i < mySessionsText.length; i++) {
                        mySessionsText[i].value = mySessions;
                    }
                    // TODAY'S ACTIVITY
                    const today = getTodayDate();

                    const activityRef = doc(db, "users", user.uid, "activity", today);

                    getDoc(activityRef).then((activitySnap) => {
                        if (activitySnap.exists()) {
                            const activityData = activitySnap.data();

                            todayDistance = (activityData.distance || 0) * 1000;
                            todayTime = (activityData.duration || 0) * 60;
                            todaySessions = activityData.sessions || 0;
                        } else {
                            todayDistance = 0;
                            todayTime = 0;
                            todaySessions = 0;
                        }

                        todayDistanceText.value = todayDistance.toFixed(1);
                        todayTimeText.value = todayTime.toFixed(1);
                        todaySessionsText.value = todaySessions;
                    });

                    // Day counter
                    // completedDays = userData.completedDays || 0;
                    //  dayNumberText.textContent = completedDays;
                    const todayDate = getTodayDate();

                    if (userData.lastResponseDate === todayDate || userData.lastCompletedDay === todayDate) {
                        disableTryingButtons("You've already answered today's question.");
                    }
                    updateAllProgress();
                } else {
                    console.log("no document found matching id");
                }
            },
            (error) => {
                console.log("Error getting document:", error);
            },
        );

        const communityRef = doc(db, "community", "totals");

        getDoc(communityRef)
            .then((communitySnap) => {
                if (communitySnap.exists()) {
                    console.log("Community Data:", communitySnap.data());
                    const communityData = communitySnap.data();
                    communityDistance = communityData.totalDistance || 0;
                    communityDistanceText.value = communityDistance.toFixed(1);
                    communityTime = communityData.totalHours || 0;
                    communityTimeText.value = communityTime.toFixed(1);
                    communitySessions = communityData.totalSessions || 0;
                    communitySessionsText.value = communitySessions;

                    communityTodayDistance = communityData.utcTodayDistance || 0;
                    communityTodayDistanceText.value = communityTodayDistance.toFixed(1);
                    communityTodayTime = communityData.utcTodayHours || 0;
                    communityTodayTimeText.value = communityTodayTime.toFixed(1);
                    communityTodaySessions = communityData.utcTodaySessions || 0;
                    communityTodaySessionsText.value = communityTodaySessions;
                }
            })
            .catch((error) => {
                console.error("Error getting community data:", error);
            });
    } else {
        // If no user is logged in, return to the login page.
        console.log("User Id not Found in Local storage");
        /* window.location.href = "index-login-page.html"; */
    }
});
// Declarations for Const Statements
const C = 5514; // Distance of Canada (km)
const A = 634; // Distance of Alberta (km)
const BC = 700; // Distance of British Columbia (km)
const M = 800; // Distance of Manitoba (km)
const NB = 242; // Distance of New Brunswick (km)
const NL = 1088; // Distance of Newfoundland and Labrador (km)
const NS = 579; // Distance of Nova Scotia (km)
const O = 1568; // Distance of Ontario (km)
const PEI = 275; // Distance of Prince Edward Island (km)
const Q = 1570; // Distance of Quebec (km)
const S = 632; // Distance of Saskatchewan (km)
//const calendar = document.getElementById("calendar");
const today = new Date();
let total = 0;
let i = 0;
let storageAlbertaTrips = 0;
let storageBritishColumbia = 0;
let storageManitoba = 0;
let newBrunswickStorage = 0;
let newfoundlandAndLabradorStorage = 0;
let novaScotiaStorage = 0;
let ontarioStorage = 0;
let princeEdwardIslandStorage = 0;
let quebecStorage = 0;
let saskatchewanStorage = 0;
let hour = today.getHours();
let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();

let albertaTrips = document.querySelectorAll(".alberta-trips");
let britishColumbiaTrips = document.querySelectorAll(".british-columbia-trips");
let manitobaTrips = document.querySelectorAll(".manitoba-trips");
let newBrunswickTrips = document.querySelectorAll(".new-brunswick-trips");
let newfoundlandAndLabradorTrips = document.querySelectorAll(".newfoundland-and-labrador-trips");
let novaScotiaTrips = document.querySelectorAll(".nova-scotia-trips");
let ontarioTrips = document.querySelectorAll(".ontario-trips");
let princeEdwardIslandTrips = document.querySelectorAll(".prince-edward-island-trips");
let quebecTrips = document.querySelectorAll(".quebec-trips");
let saskatchewanTrips = document.querySelectorAll(".saskatchewan-trips");
//let myTotalActiveDuration = document.getElementById("active-duration-percentage");
let totalTrips = document.getElementById("number-trips");

// Conditional for Calendar Feature
if (day < 10) {
    day = "0" + day;
}

if (month < 10) {
    month = "0" + month;
}


const tryingButton = document.getElementById("yes-button");
tryingButton.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
        return;
    }

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    const todayDate = getTodayDate();

    if (userData.lastResponseDate === todayDate || userData.lastCompletedDay === todayDate) {
        alert("You've already recorded today's effort.");
        return;
    }

    // UPDATE STREAK
    const lastStreakDate = userData.lastStreakDate || "";
    const currentStreak = userData.streak || 0;

    let newStreak = 1;

    if (lastStreakDate) {
        const lastDate = new Date(lastStreakDate + "T00:00:00");
        const today = new Date(todayDate + "T00:00:00");

        const difference = (today - lastDate) / (1000 * 60 * 60 * 24);

        if (difference === 1) {
            newStreak = currentStreak + 1;
        }
    }

    // UPDATE EVERYTHING
    await updateDoc(userRef, {
        completedDays: increment(1),
        lastCompletedDay: todayDate,
        streak: newStreak,
        lastStreakDate: todayDate,
    });

    disableTryingButtons();

    alert("Today's effort has been recorded!");
});

const noButton = document.getElementById("no-button");
noButton.addEventListener("click", async () => {
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    const todayDate = getTodayDate();
    if (userData.lastResponseDate === todayDate || userData.lastCompletedDay === todayDate) {
        alert("You've already answered today's question.");
        return;
    }
    await updateDoc(userRef, {
        lastResponseDate: todayDate,
    });
    disableTryingButtons();

    alert("Thanks for letting us know.");
});

function disableTryingButtons() {
    tryingButton.disabled = true;
    noButton.disabled = true;
}
function getTodayDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function updateAllProgress() {
    //updateTrips();

    albertaConditional();
    britishColumbiaConditional();
    manitobaConditional();
    newBrunswickConditional();
    newfoundlandAndLabradorConditional();
    novaScotiaConditional();
    ontarioConditional();
    princeEdwardIslandConditional();
    quebecConditional();
    saskatchewanConditional();
}

function updateTrips() {
    totalTrips.value = (myTotal.value / C).toFixed(3);
}

function albertaConditional() {
    albertaTrips.forEach((input) => {
        input.value = Math.min((myDistance / A) * 100, 100).toFixed(2);
    });
}

function britishColumbiaConditional() {
    britishColumbiaTrips.forEach((input) => {
        input.value = Math.min((myDistance / BC) * 100, 100).toFixed(2);
    });
}

function manitobaConditional() {
    manitobaTrips.forEach((input) => {
        input.value = Math.min((myDistance / M) * 100, 100).toFixed(2);
    });
}

function newBrunswickConditional() {
    newBrunswickTrips.forEach((input) => {
        input.value = Math.min((myDistance / NB) * 100, 100).toFixed(2);
    });
}

function newfoundlandAndLabradorConditional() {
    newfoundlandAndLabradorTrips.forEach((input) => {
        input.value = Math.min((myDistance / NL) * 100, 100).toFixed(2);
    });
}

function novaScotiaConditional() {
    novaScotiaTrips.forEach((input) => {
        input.value = Math.min((myDistance / NS) * 100, 100).toFixed(2);
    });
}

function ontarioConditional() {
    ontarioTrips.forEach((input) => {
        input.value = Math.min((myDistance / O) * 100, 100).toFixed(2);
    });
}

function princeEdwardIslandConditional() {
    princeEdwardIslandTrips.forEach((input) => {
        input.value = Math.min((myDistance / PEI) * 100, 100).toFixed(2);
    });
}

function quebecConditional() {
    quebecTrips.forEach((input) => {
        input.value = Math.min((myDistance / Q) * 100, 100).toFixed(2);
    });
}

function saskatchewanConditional() {
    saskatchewanTrips.forEach((input) => {
        input.value = Math.min((myDistance / S) * 100, 100).toFixed(2);
    });
}
