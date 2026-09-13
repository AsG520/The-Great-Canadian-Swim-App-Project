// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// Import Firestore and functions used to access and update user data within
import { getFirestore, getDoc, doc, updateDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut, reauthenticateWithPopup, reauthenticateWithCredential, GoogleAuthProvider, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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

let currentUser = null;
let username = "";
let displayUsername = "";
let location = "";
let yourReason = "";
let dayNumberSwum = "";
let myTotalDistance = "";
let myTotalHours = "";
let showUpValue = "";
let improveMyHealthValue = "";
let supportMyCommunityValue = "";
let otherValue = "";
let showUpWord = "";
let improveMyHealthWord = "";
let supportMyCommunityWord = "";
let otherWord = "";
let yourGoals = "";
let myAge = "";
let myGender = "";
const usernameText = document.getElementById("username-details");
const locationText = document.getElementById("location-details");
const yourReasonText = document.getElementById("why-container");
const dayNumberSwumText = document.getElementById("days-swum");
const myTotalDistanceText = document.getElementById("total-distance");
const myTotalHoursText = document.getElementById("total-hours");
const goalSelectionText = document.getElementById("goal");
const myAgeText = document.getElementById("age");
const myGenderText = document.getElementById("gender");

const expDisplay = document.getElementById("exp");
const levelDisplay = document.getElementById("level");
const streakDisplay = document.getElementById("streak");

const profile = document.getElementById("img-profile");
const pencile = document.getElementById("pencile-icon");
const input = document.getElementById("select-file");
// checks if user is logged in
onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!user) return;

    await updateStreak(user);

    try {
        //const docRef = doc(db, "users", user.uid);
        const profileRef = doc(db, "profiles", user.uid);

        const profileSnapshot = await getDoc(profileRef);

        if (profileSnapshot.exists()) {
            const profileData = profileSnapshot.data();

            profile.src = profileData.pfpUrl || "profile-picture.png";
            username = profileData.username || "";
            usernameText.textContent = username;

            location = profileData.location || "";
            locationText.textContent = location + ", Canada";

            myAge = profileData.age || "";
            myAgeText.value = myAge;

            myGender = profileData.gender || "";
            myGenderText.value = myGender;

            yourReason = profileData.myReason || "";
            yourReasonText.value = yourReason;
        }

        // private data
        // Only get private user data if
        // we're viewing our own profile
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
            // Checks if document exists
            const userData = userSnapshot.data(); // Converst Firebase data to JavaScript =
            // Displays taken user data in a way it can be put on an html page to be seen
            username = userData.username;
            //https://stackoverflow.com/questions/14688141/convert-first-letter-to-uppercase-on-input-box - Control f and type: "8 Answers"
            displayUsername = username.charAt(0).toUpperCase() + username.substr(1);
            usernameText.textContent = displayUsername;
            location = userData.location;
            locationText.textContent = "🍁 " + location + ", Canada";
            yourReason = userData.myReason;
            yourReasonText.value = yourReason;

            myTotalDistance = userData.myDistance;
            myTotalDistanceText.value = myTotalDistance;
            myTotalHours = userData.myHours;
            myTotalHoursText.value = myTotalHours;
            showUpValue = userData.showUp;
            improveMyHealthValue = userData.improveHealth;
            supportMyCommunityValue = userData.supportCommunity;
            otherValue = userData.otherReason;

            expDisplay.value = userData.exp || 0;
            levelDisplay.value = userData.level || 0;

            dayNumberSwum = userData.completedDays || 0;
            dayNumberSwumText.value = dayNumberSwum;

            if (showUpValue) {
                showUpWord = "Show Up";
                if ((improveMyHealthValue && !supportMyCommunityValue && !otherValue) || (!improveMyHealthValue && supportMyCommunityValue && !otherValue) || (!improveMyHealthValue && !supportMyCommunityValue && otherValue)) {
                    showUpWord += " and ";
                } else if (!(!improveMyHealthValue && !supportMyCommunityValue && !otherValue)) {
                    showUpWord += ", ";
                }
            }
            if (improveMyHealthValue) {
                improveMyHealthWord = "Improve my health";
                if ((!supportMyCommunityValue && otherValue) || (supportMyCommunityValue && !otherValue)) {
                    improveMyHealthWord += " and ";
                } else if (!(!supportMyCommunityValue && !otherValue)) {
                    improveMyHealthWord += ", ";
                }
            }
            if (supportMyCommunityValue) {
                supportMyCommunityWord = "Support my community";
                if (otherValue) {
                    supportMyCommunityWord += " and ";
                }
            }
            if (otherValue) {
                otherWord = "Other";
            }
            yourGoals = showUpWord + improveMyHealthWord + supportMyCommunityWord + otherWord;
            goalSelectionText.value = yourGoals;
            myAge = userData.age;
            myAgeText.value = myAge;
            myGender = userData.gender;
            myGenderText.value = myGender;
        } else {
            console.log("No document found matching ID");
        }
    } catch (error) {
        console.error(error);
    }
});
function getTodayDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

async function updateStreak(user) {
    try {
        const activityRef = collection(db, "users", user.uid, "activity");

        const activitySnapshot = await getDocs(activityRef);

        // Store all days where the user either:
        // 1. Actually swam or Clicked the "Trying" button
        const activeDays = [];

        activitySnapshot.forEach((activityDoc) => {
            const data = activityDoc.data();

            // A day counts if they swam OR made an effort by clicking Trying
            if ((data.sessions || 0) > 0 || data.trying === true) {
                activeDays.push(activityDoc.id);
            }
        });

        // Sort newest day first
        activeDays.sort();
        activeDays.reverse();

        if (activeDays.length === 0) {
            streakDisplay.value = 0;
            return;
        }

        const today = getTodayDate();

        // Streak must include today
        if (activeDays[0] !== today) {
            streakDisplay.value = 0;
            return;
        }

        let streak = 1;

        // Check previous days
        for (let i = 1; i < activeDays.length; i++) {
            const previousDay = new Date(activeDays[i - 1] + "T00:00:00");

            const currentDay = new Date(activeDays[i] + "T00:00:00");

            const difference = (previousDay - currentDay) / (1000 * 60 * 60 * 24);

            if (difference === 1) {
                streak++;
            } else {
                break;
            }
        }

        streakDisplay.value = streak;
    } catch (error) {
        console.error("Error calculating streak:", error);
    }
}

// Selecting profile picture, saving it through js (through pasting on canvas, shrinking size and saving the image URL to firestore for later access )
pencile.addEventListener("click", () => {
    input.click();
});

input.addEventListener("change", async () => {
    const file = input.files && input.files[0];

    if (!file || !file.type.startsWith("image/")) {
        return;
    }

    try {
        const user = auth.currentUser;

        if (!user) {
            console.log("User is not signed in");
            return;
        }
        // Create a empty image
        const image = new Image();

        // Creates a temporary browser URL that goes to the file, leting browser access selected image
        image.src = URL.createObjectURL(file);
        // Waits till image loads
        image.onload = async () => {
            // Maximum width/height
            const maxSize = 100;

            //Gets the image's width and height
            let width = image.width;
            let height = image.height;

            // Resize the image
            // Checks if the image is wider
            if (width > height) {
                if (width > maxSize) {
                    height = height * (maxSize / width);
                    width = maxSize;
                }
            } else {
                // if image is taller
                if (height > maxSize) {
                    width = width * (maxSize / height);
                    height = maxSize;
                }
            }

            // Create canvas (a blank digital document)
            const canvas = document.createElement("canvas");

            // Setting the canvas's height and width to the dimensions of image's new size
            canvas.width = width;
            canvas.height = height;

            // Gets the tool to draw/create the image on the canvas
            const context = canvas.getContext("2d");

            // Creates the image on the canvas
            context.drawImage(image, 0, 0, width, height); // Creates the image in the correct position and size

            // Convert image to a compressed Base64 string (converting it into a data URL) and only saving 70% of its quality (to save storage)
            const imageData = canvas.toDataURL("image/jpeg", 0.7);

            // Show image immediately
            profile.src = imageData;

            // Save image to Firestore
            await updateDoc(doc(db, "profiles", user.uid), {
                pfpUrl: imageData,
            });

            console.log("Profile picture saved!");

            URL.revokeObjectURL(image.src); //Deletes the temporary URL from browser resources
        };
    } catch (error) {
        console.error("Error saving profile picture:", error);
    }
});

let controlPanelDetails = document.getElementById("control-panel");

async function handleControlPanelSelection() {
    let selectedValue = controlPanelDetails.value;

    if (selectedValue === "User Stats") {
        window.location.href = "index-user-stats-page.html";
        selectedValue = "";
    }

    if (selectedValue === "Logout") {
        // Log out
        signOut(auth) //logout on firebase
            .then(() => {
                // Return to login page
                window.location.href = "index-login-page.html";
            })
            .catch((error) => {
                console.error("Error Signing out:", error);
            });
        selectedValue = "";
    }

    if (selectedValue === "Delete Account") {
        const user = auth.currentUser;

        if (!user) {
            alert("No user is currently signed in.");
            return;
        }

        try {
            // Confirm before deleting
            const confirmed = confirm("Are you sure you want to permanently delete your account?");

            if (!confirmed) {
                return;
            }

            // Find out how the user signed in through the provider field in Firestore
            const userRef = doc(db, "users", user.uid);
            const profileRef = doc(db, "profiles", user.uid);
            const activityRef = collection(db, "users", user.uid, "activity");

            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            const provider = userData.provider;
            // Re-authenticate the user
            if (provider === "google") {
                const googleProvider = new GoogleAuthProvider();

                await reauthenticateWithPopup(user, googleProvider);
            } else if (provider === "password") {
                const password = prompt("Please enter your password to confirm account deletion:");

                if (!password) {
                    alert("Account deletion cancelled.");
                    return;
                }

                const credential = EmailAuthProvider.credential(user.email, password);

                await reauthenticateWithCredential(user, credential);
            } else {
                alert("This account uses an unsupported sign-in method.");
                return;
            }

            // Delete all activity documents
            const activitySnapshot = await getDocs(activityRef);

            for (const activityDoc of activitySnapshot.docs) {
                await deleteDoc(activityDoc.ref);
            }

            // DELETE USER DOCUMENT
            await deleteDoc(userRef);

            // DELETE PROFILE DOCUMENT
            await deleteDoc(profileRef);

            // DELETE FIREBASE AUTHENTICATION ACCOUNT
            await user.delete();

            alert("Account deleted successfully.");

            window.location.href = "index-login-page.html";
        } catch (error) {
            console.error("Error deleting account:", error);

            if (error.code === "auth/wrong-password") {
                alert("Incorrect password. Your account was not deleted.");
            } else if (error.code === "auth/popup-closed-by-user") {
                alert("Google sign-in was cancelled. Your account was not deleted.");
            } else if (error.code === "auth/requires-recent-login") {
                alert("Please sign in again before deleting your account.");
            } else {
                alert("Failed to delete account.");
            }
            selectedValue = "";
        }
    }
}

controlPanelDetails.addEventListener("change", handleControlPanelSelection);

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
