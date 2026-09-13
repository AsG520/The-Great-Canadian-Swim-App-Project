let settings = document.getElementById("settings-box");

function callSettingsPage() {
    window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);

// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// Import Firestore and functions used to access and update user data within
import { getFirestore, doc, onSnapshot, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    // Identifies firebase project to link to
    apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
    authDomain: "testing-database-c0a2c.firebaseapp.com",
    projectId: "testing-database-c0a2c",
    storageBucket: "testing-database-c0a2c.firebasestorage.app",
    messagingSenderId: "879740645963",
    appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
};

// Initialize firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
const NWT = 4500; // Distance around Northwest Territories (km)
const NU = 7500; // Distance around Nunavut (km)
const Y = 2800; // Distance around Yukon (km)

let currentUser = null;

let badgeUnlockedNumber = 0;

let totalSessionsNumber = 0;
let totalDurationMinutes = 0;
let totalDurationHours = 0;

let totalDistanceMeters = 0;
let totalDistanceKilometers = 0;

const expDisplay = document.getElementById("exp");
const levelDisplay = document.getElementById("level");

const totalBadgesUnlocked = document.getElementById("badge-number");
const badgefirstSplash = document.getElementById("first-splash-badge");
const badge15Minutes = document.getElementById("15-minutes-badge");
const badge30Minutes = document.getElementById("30-minutes-badge");
const badge1Hour = document.getElementById("1-hour-badge");
const badge2Hours = document.getElementById("2-hours-badge");
const badge500Meters = document.getElementById("500-meters-badge");
const badge1Km = document.getElementById("1-kilometer-badge");
const badge2Km = document.getElementById("two-kilometers-badge");
const badge5Km = document.getElementById("five-kilometers-badge");
const badge10Km = document.getElementById("ten-kilometers-badge");
const badgeAlberta = document.getElementById("alberta-badge");
const badgeBritishColumbia = document.getElementById("british-columbia-badge");
const badgeManitoba = document.getElementById("manitoba-badge");
const badgeNewBrunswick = document.getElementById("new-brunswick-badge");
const badgeNewfoundlandAndLabrador = document.getElementById("newfoundland-and-labrador-badge");
const badgeQuebec = document.getElementById("quebec-badge");
const badgeNovaScotia = document.getElementById("nova-scotia-badge");
const badgeOntario = document.getElementById("ontario-badge");
const badgePrinceEdwardIsland = document.getElementById("prince-edward-island-badge");
const badgeSaskatchewan = document.getElementById("saskatchewan-badge");
const badgeNorthwestTerritories = document.getElementById("northwest-territories-badge");
const badgeNunavut = document.getElementById("nunavut-badge");
const badgeYukon = document.getElementById("yukon-badge");
const badgeCanada = document.getElementById("canada-badge");

badgefirstSplash.src = "first-splash-badge-grey.png";
badge15Minutes.src = "15-minutes-badge-grey.png";
badge30Minutes.src = "30-minutes-badge-grey.png";
badge1Hour.src = "1-hour-badge-grey.png";
badge2Hours.src = "2-hours-badge-grey.png";
badge500Meters.src = "500-meters-badge-grey.png";
badge1Km.src = "1-kilometer-badge-grey.png";
badge2Km.src = "2-kilometers-badge-grey.png";
badge5Km.src = "5-kilometers-badge-grey.png";
badge10Km.src = "10-kilometers-badge-grey.png";
badgeAlberta.src = "alberta-badge-grey.png";
badgeBritishColumbia.src = "british-columbia-badge-grey.png";
badgeManitoba.src = "manitoba-badge-grey.png";
badgeNewBrunswick.src = "new-brunswick-badge-grey.png";
badgeNewfoundlandAndLabrador.src = "newfoundland-and-labrador-badge-grey.png";
badgeQuebec.src = "quebec-badge-grey.png";
badgeNovaScotia.src = "nova-scotia-badge-grey.png";
badgeOntario.src = "ontario-badge-grey.png";
badgePrinceEdwardIsland.src = "prince-edward-island-badge-grey.png";
badgeSaskatchewan.src = "saskatchewan-badge-grey.png";
badgeNorthwestTerritories.src = "northwest-territories-badge-grey.png";
badgeNunavut.src = "nunavut-badge-grey.png";
badgeYukon.src = "yukon-badge-grey.png";
badgeCanada.src = "canada-badge-grey.png";

onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    onSnapshot(
        docRef,
        async (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                let expIncrease = 0;
                // Create badges field if it doesn't exist
                if (!userData.badges) {
                    setDoc(
                        docRef,
                        {
                            badges: {
                                badgeUnlockedNumber: 0,
                                badge1SessionUnlocked: false,
                                badge15MinutesUnlocked: false,
                                badge30MinutesUnlocked: false,
                                badge1HourUnlocked: false,
                                badge2HoursUnlocked: false,
                                badge500MetersUnlocked: false,
                                badge1KmUnlocked: false,
                                badge2KmUnlocked: false,
                                badge5KmUnlocked: false,
                                badge10KmUnlocked: false,
                                badgeAlbertaUnlocked: false,
                                badgeBritishColumbiaUnlocked: false,
                                badgeManitobaUnlocked: false,
                                badgeNewBrunswickUnlocked: false,
                                badgeNewfoundlandAndLabradorUnlocked: false,
                                badgeQuebecUnlocked: false, // note: this badge is not on the badge page, but is included here for future use
                                badgeNovaScotiaUnlocked: false,
                                badgeOntarioUnlocked: false,
                                badgePrinceEdwardIslandUnlocked: false,
                                badgeSaskatchewanUnlocked: false,
                                badgeNorthwestTerritoriesUnlocked: false, // note: this badge is not on the badge page, but is included here for future use
                                badgeNunavutUnlocked: false, // note: this badge is not on the badge page, but is included here for future use
                                badgeYukonUnlocked: false, // note: this badge is not on the badge page, but is included here for future use
                                badgeCanadaUnlocked: false, // note: this badge is not on the badge page, but is included here for future use
                            },
                        },
                        { merge: true },
                    );

                    return; // Wait for the snapshot to update with the new field
                }
                function unlockBadge(badgeName) {
                    if (!userData.badges[badgeName]) {
                        userData.badges[badgeName] = true;
                        // Increase the saved badge count
                        userData.badges.badgeUnlockedNumber = (userData.badges.badgeUnlockedNumber || 0) + 1;

                        return true; // Badge was unlocked
                    }

                    return false; // Badge was already unlocked
                }

                // Custom user message function
                async function customBadgeAlert(message, badgeImage) {
                    const badgeAlertBox = document.getElementById("badgeUnlockAlert");
                    const badgeUnlockText = document.getElementById("badgeUnlockText");
                    const badgeUnlockImage = document.getElementById("badgeUnlockImage");

                    badgeUnlockText.textContent = message;
                    badgeUnlockImage.src = badgeImage;

                    // Wait 2 seconds before showing the popup
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    badgeAlertBox.style.display = "block";

                    // Keep popup visible for 3 seconds
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    badgeAlertBox.style.display = "none";

                    // Wait 1 second before allowing the next popup
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                totalSessionsNumber = userData.mySessions;

                totalDurationMinutes = userData.myHours * 60;
                totalDurationHours = userData.myHours;

                totalDistanceKilometers = userData.myDistance;
                totalDistanceMeters = userData.myDistance * 1000;

                if (totalSessionsNumber >= 1) {
                    const justUnlocked = unlockBadge("badge1SessionUnlocked");
                    badgefirstSplash.src = "first-splash-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 First Splash Badge Unlocked!", "first-splash-badge.png");
                        expIncrease += 250;
                    }
                }
                if (totalDurationMinutes >= 15) {
                    const justUnlocked = unlockBadge("badge15MinutesUnlocked");
                    badge15Minutes.src = "15-minutes-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 15 Minutes Badge Unlocked!", "15-minutes-badge.png");
                        expIncrease += 300;
                    }
                }
                if (totalDurationMinutes >= 30) {
                    const justUnlocked = unlockBadge("badge30MinutesUnlocked");
                    badge30Minutes.src = "30-minutes-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 30 Minutes Badge Unlocked!", "30-minutes-badge.png");
                        expIncrease += 600;
                    }
                }
                if (totalDurationHours >= 1) {
                    const justUnlocked = unlockBadge("badge1HourUnlocked");
                    badge1Hour.src = "1-hour-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 1 Hour Badge Unlocked!", "1-hour-badge.png");
                        expIncrease += 1200;
                    }
                }
                if (totalDurationHours >= 2) {
                    const justUnlocked = unlockBadge("badge2HoursUnlocked");
                    badge2Hours.src = "2-hours-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 2 Hours Badge Unlocked!", "2-hours-badge.png");
                        expIncrease += 2400;
                    }
                }
                if (totalDistanceMeters >= 500) {
                    const justUnlocked = unlockBadge("badge500MetersUnlocked");
                    badge500Meters.src = "500-meters-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 500 Meters Badge Unlocked!", "500-meters-badge.png");
                        expIncrease += 200;
                    }
                }
                if (totalDistanceKilometers >= 1) {
                    const justUnlocked = unlockBadge("badge1KmUnlocked");
                    badge1Km.src = "1-kilometer-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 1 Kilometer Badge Unlocked!", "1-kilometer-badge.png");
                        expIncrease += 400;
                    }
                }
                if (totalDistanceKilometers >= 2) {
                    const justUnlocked = unlockBadge("badge2KmUnlocked");
                    badge2Km.src = "2-kilometers-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 2 Kilometers Badge Unlocked!", "2-kilometers-badge.png");
                        expIncrease += 800;
                    }
                }
                if (totalDistanceKilometers >= 5) {
                    const justUnlocked = unlockBadge("badge5KmUnlocked");
                    badge5Km.src = "5-kilometers-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 5 Kilometers Badge Unlocked!", "5-kilometers-badge.png");
                        expIncrease += 1600;
                    }
                }
                if (totalDistanceKilometers >= 10) {
                    const justUnlocked = unlockBadge("badge10KmUnlocked");
                    badge10Km.src = "10-kilometers-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 10 Kilometers Badge Unlocked!", "10-kilometers-badge.png");
                        expIncrease += 3200;
                    }
                }
                if (totalDistanceKilometers >= A) {
                    const justUnlocked = unlockBadge("badgeAlbertaUnlocked");
                    badgeAlberta.src = "alberta-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Alberta Badge Unlocked!", "alberta-badge.png");
                        expIncrease += 12000;
                    }
                }
                if (totalDistanceKilometers >= BC) {
                    const justUnlocked = unlockBadge("badgeBritishColumbiaUnlocked");
                    badgeBritishColumbia.src = "british-columbia-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 British Columbia Badge Unlocked!", "british-columbia-badge.png");
                        expIncrease += 13000;
                    }
                }
                if (totalDistanceKilometers >= M) {
                    const justUnlocked = unlockBadge("badgeManitobaUnlocked");
                    badgeManitoba.src = "manitoba-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Manitoba Badge Unlocked!", "manitoba-badge.png");
                        expIncrease += 10000;
                    }
                }
                if (totalDistanceKilometers >= NB) {
                    const justUnlocked = unlockBadge("badgeNewBrunswickUnlocked");
                    badgeNewBrunswick.src = "new-brunswick-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 New Brunswick Badge Unlocked!", "new-brunswick-badge.png");
                        expIncrease += 7000;
                    }
                }
                if (totalDistanceKilometers >= NL) {
                    const justUnlocked = unlockBadge("badgeNewfoundlandAndLabradorUnlocked");
                    badgeNewfoundlandAndLabrador.src = "newfoundland-and-labrador-badge.png";
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Newfoundland and Labrador Badge Unlocked!", "newfoundland-and-labrador-badge.png");
                        expIncrease += 8000;
                    }
                }
                if (totalDistanceKilometers >= Q) {
                    badgeQuebec.src = "quebec-badge.png";
                    const justUnlocked = unlockBadge("badgeQuebecUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Quebec Badge Unlocked!", "quebec-badge.png");
                        expIncrease += 16000;
                    }
                }
                if (totalDistanceKilometers >= NS) {
                    badgeNovaScotia.src = "nova-scotia-badge.png";
                    const justUnlocked = unlockBadge("badgeNovaScotiaUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Nova Scotia Badge Unlocked!", "nova-scotia-badge.png");
                        expIncrease += 6000;
                    }
                }
                if (totalDistanceKilometers >= O) {
                    badgeOntario.src = "ontario-badge.png";
                    const justUnlocked = unlockBadge("badgeOntarioUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Ontario Badge Unlocked!", "ontario-badge.png");
                        expIncrease += 14000;
                    }
                }
                if (totalDistanceKilometers >= PEI) {
                    badgePrinceEdwardIsland.src = "prince-edward-island-badge.png";
                    const justUnlocked = unlockBadge("badgePrinceEdwardIslandUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Prince Edward Island Badge Unlocked!", "prince-edward-island-badge.png");
                        expIncrease += 5000;
                    }
                }
                if (totalDistanceKilometers >= S) {
                    badgeSaskatchewan.src = "saskatchewan-badge.png";
                    const justUnlocked = unlockBadge("badgeSaskatchewanUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Saskatchewan Badge Unlocked!", "saskatchewan-badge.png");
                        expIncrease += 11000;
                    }
                }
                if (totalDistanceKilometers >= NWT) {
                    badgeNorthwestTerritories.src = "northwest-territories-badge.png";
                    const justUnlocked = unlockBadge("badgeNorthwestTerritoriesUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Northwest Territories Badge Unlocked!", "northwest-territories-badge.png");
                        expIncrease += 15000;
                    }
                }
                if (totalDistanceKilometers >= NU) {
                    badgeNunavut.src = "nunavut-badge.png";
                    const justUnlocked = unlockBadge("badgeNunavutUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Nunavut Badge Unlocked!", "nunavut-badge.png");
                        expIncrease += 17000;
                    }
                }
                if (totalDistanceKilometers >= Y) {
                    badgeYukon.src = "yukon-badge.png";
                    const justUnlocked = unlockBadge("badgeYukonUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Yukon Badge Unlocked!", "yukon-badge.png");
                        expIncrease += 9000;
                    }
                }
                if (totalDistanceKilometers >= C) {
                    badgeCanada.src = "canada-badge.png";
                    const justUnlocked = unlockBadge("badgeCanadaUnlocked");
                    if (justUnlocked) {
                        await customBadgeAlert("🏅 Canada Badge Unlocked!", "canada-badge.png");
                        expIncrease += 20000;
                    }
                }
                if (expIncrease > 0) {
                    const newExp = (userData.exp || 0) + expIncrease;
                    await setDoc(
                        docRef,
                        {
                            badges: userData.badges,
                            exp: increment(expIncrease),
                            level: Math.floor(newExp / 5000),
                        },
                        { merge: true },
                    );
                }
                badgeUnlockedNumber = userData.badges.badgeUnlockedNumber || 0;
                totalBadgesUnlocked.textContent = badgeUnlockedNumber;
                expDisplay.value = userData.exp || 0;
                levelDisplay.value = Math.floor((userData.exp || 0) / 5000);
            } else {
                console.log("No document found matching ID");
            }
        },
        (error) => {
            console.error(error);
        },
    );
});
