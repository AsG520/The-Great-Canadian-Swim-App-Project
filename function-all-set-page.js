// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// Import Firestore and functions used to access and update user data within
import {
  getFirestore,
  getDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
  // Identifies firebase project to link to
  apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
  authDomain: "testing-database-c0a2c.firebaseapp.com",
  projectId: "testing-database-c0a2c",
  storageBucket: "testing-database-c0a2c.firebasestorage.app",
  messagingSenderId: "879740645963",
  appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
};

// Custom user message function
function customAlert(message) {
  // links to html element for formating
  const alertBox = document.getElementById("customAlert");

  document.getElementById("alertText").textContent = message;
  alertBox.style.display = "block";

  setTimeout(() => {
    alertBox.style.display = "none";
  }, 3000); // Hides after 3 seconds
}

// Initialize firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

let yourReason = "";

let showUpValue = false;
let improveMyHealthValue = false;
let supportMyCommunityValue = false;
let otherValue = false;

let showUpWord = "";
let improveMyHealthWord = "";
let supportMyCommunityWord = "";
let otherWord = "";
const yourReasonText = document.getElementById("your-Reason-Text");
let yourGoals = "";
const goalChoiceSelection = document.getElementById("subtitle");
// checks if user is logged in
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (!user) return;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Checks if document exists
      const userData = docSnap.data(); // Converst Firebase data to JavaScript =
      // Displays taken user data in a way it can be put on an html page to be seen
      yourReason = userData.myReason || "";
      yourReasonText.textContent = yourReason;
      showUpValue = userData.showUp;
      improveMyHealthValue = userData.improveHealth;
      supportMyCommunityValue = userData.supportCommunity;
      otherValue = userData.otherReason;
      if (showUpValue) {
        showUpWord = "Show Up" + "<br>";
      }

      if (improveMyHealthValue) {
        improveMyHealthWord = "Improve my health" + "<br>";
      }

      if (supportMyCommunityValue) {
        supportMyCommunityWord = "Support my community" + "<br>";
      }

      if (otherValue) {
        otherWord = "Other" + "<br>";
      }

      yourGoals =
        showUpWord +
        improveMyHealthWord +
        supportMyCommunityWord +
        otherWord;
      goalChoiceSelection.innerHTML = yourGoals;
    } else {
      console.log("No document found matching ID");
    }
  } catch (error) {
    console.error(error);
  }
});

// Submit user information
// Link html sumbit but to js
const submit = document.getElementById("gotohome");

// When clicking the submit button this runs
submit.addEventListener("click", async () => {
  // Stores user data in a document
  const updateData = {
    allSetPageCompleted: true, // Sets value to ture to save that the user has filled out the credentials page
  };
  // Gets logged in user UID
  const user = currentUser;

  if (!user) {
    customAlert("You must be signed in.");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  try {
    console.log("Current user:", auth.currentUser);
    console.log("Auth UID:", auth.currentUser?.uid);
    await updateDoc(userRef, updateData);
    customAlert("You're all set. Welcome to the homepage.");
   /* setTimeout(() => {
      window.location.href = "homepage.html";
    }, 1000); */
  } catch (error) {
    console.error(error);
    customAlert(error.message);
  }
});
