// Basically, allows user to create an account (e.g. email/password, Google) and creates the storage base for data handling.

// Import the functions you need from the SDKs you need
// Imports the Firebase App to allow connect of Firebase to project.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js"; // Imports firebase connection tools
// Imports Firebase Firestore functions to create, retrieve, update, and modify database documents
import { getFirestore, setDoc, updateDoc, doc, getDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"; // connects to Firebase's database, Firebase stores UID, Email and password, while Firestore holds other info
// Imports Firebase Authentication functions to create accounts, sign in, sign in with Google, and reset password
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

//project configuration
const firebaseConfig = {
    // Identifies firebase project to link to
    apiKey: "AIzaSyANYbFNAyk1fAaDXc7gPnkeRNTTgXyeViU",
    authDomain: "testing-database-c0a2c.firebaseapp.com",
    projectId: "testing-database-c0a2c",
    storageBucket: "testing-database-c0a2c.firebasestorage.app",
    messagingSenderId: "879740645963",
    appId: "1:879740645963:web:f7419ce03565bf401fd3ce",
    measurementId: "G-TVHDNT78JT",
    //WATCH THIS VIDEO TO LEARN WHAT TO PUT HERE   https://youtu.be/_Xczf06n6x0
};
// ----- Initialize Firebase -----

// Initializes the Firebase application using the project configuration
const app = initializeApp(firebaseConfig);

// Creates the Firebase Authentication connection to manage user accounts
const auth = getAuth(app);

// Creates the Firestore database connection to store and retrieve user data/information
const db = getFirestore(app);

// ----- Follow another user ----

// Allows one user to follow another user by adding their IDs to each other's Firestore collections
async function followUser(currentUserId, userToFollowId) {
  // Reference to the current user's following list
  const followingRef = doc(
    db,
    "profiles",
    currentUserId,
    "following",
    userToFollowId,
  );

  // Reference to the other user's followers list
  const followerRef = doc(
    db,
    "profiles",
    userToFollowId,
    "followers",
    currentUserId,
  );

  // Add the user to the current user's following list
  await setDoc(followingRef, {
    userId: userToFollowId,
  });

  // Add the current user to the other user's followers list
  await setDoc(followerRef, {
    userId: currentUserId,
  });

  console.log("User followed!");
}

// Creates a collection in Firestore (initalized only when not previously created) to store community (all users) collected/stored data
async function createCommunityTotals() {
    const communityRef = doc(db, "community", "totals");
    // Checks if the document exists already
    const communitySnap = await getDoc(communityRef);

// Creates the document only if it does not already exist
    if (!communitySnap.exists()) {
        await setDoc(communityRef, {
            totalDistance: 0,
            totalHours: 0,
            totalSessions: 0,
            totalAttempts: 0,
        });

        console.log("Community totals created");
    }
}

// ----- Reset Password Function -----

// Finds the forgot-password control on the current page (on HTML)
const forgotPassword = document.getElementById("forgot-password-word");
console.log(forgotPassword);
// Checks whether the forgot-password control exists before adding its click event
if (forgotPassword) {
    forgotPassword.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim().toLowerCase();

        // Stops the reset process if the email field is empty, giving a message to the user to enter a email in first
        if (!email) {
            customAlert("Please enter your email first.");
            return;
        }
// Requests a password-reset email from Firebase Authentication
        try {
            await sendPasswordResetEmail(auth, email); //video: https://www.youtube.com/watch?v=XpMnUNWMyQI
// Notifies user to check email for reset password email, in order to change password
        customAlert("Password reset email sent. Check your inbox. (It may appear in Spam/Trash)");
        // Handles errors when Firebase cannot send the reset email
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                customAlert("No account found with this email.");
            } else {
                customAlert("Unable to send reset email.");
                console.log(error);
            }
        }
    });
}
// ----- Google Signin and Signup Process -----

// Sets up Google as an option for authentication 
const googleProvider = new GoogleAuthProvider(); // link: https://firebase.google.com/docs/auth/web/google-signin?utm_source

// Prompts the user to choose which Google account they want to use (prevents a direct signin to account previously signed in, allowing user to use a different account)
googleProvider.setCustomParameters({
    prompt: "select_account",
});

// Finds the Google sign-in button on the current page (on HTML)
const googleSignIn = document.getElementById("googleSignIn");

// Checks whether the Google sign-in button exists before adding its click event
if (googleSignIn) {
    googleSignIn.addEventListener("click", async () => {
        try {
            // Opens Google's sign-in popup and waits for user to authenticate
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Uses default name values in case the Google account does not provide a display name
            let firstName = "N/A";
            let lastName = "N/A";

            // Extracts the user's first and last name when Google provides a display name
            if (user.displayName) {
                const name = user.displayName.split(" ");

                firstName = name[0];

                if (name[1]) {
                    lastName = name[1];
                }
            }

            // ----- USER DOCUMENT -----

            // Retrieves the user's main personal information document
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // Creates the user's personal information document if this is their first Google sign-in (if not created before)
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    firstName: firstName,
                    email: user.email.toLowerCase(),
                    provider: "google",
                    myDistance: 0,
                    myHours: 0,
                    mySessions: 0,
                    myAttempts: 0,
                    lastSessionDate: "",
                    username: "",
                    level: 0,
                    exp: 0,
                    lastStreakDate: "",
                    streak: 0,
                    credentialsCompleted: false,
                    aboutYouCompleted: false,
                    whatReasonCompleted: false,
                    yourGoalCompleted: false,
                    allSetPageCompleted: false,
                    dayNumber: 1,
                    completedDays: 0,
                    lastCompletedDay: "",
                    startDate: new Date().toISOString(),
                });
            } else {
                // Updates the existing user's sign-in provider and awards 5 experience points if this is not the first time they signed-in
                // Sign-in provider is altered to prevent an error where if a user sign-in with email/password then with google, google's authentication overrides email/password
                await updateDoc(userRef, {
                    provider: "google",
                    exp: increment(5),
                });
            }

            // ----- PROFILE DOCUMENT -----
            // Retrieves the user's public profile document from Firestore.
            const profileRef = doc(db, "profiles", user.uid);
            const profileSnap = await getDoc(profileRef);

            // Creates a profile with default values if the user does not have one yet
            if (!profileSnap.exists()) {
                await setDoc(profileRef, {
                    username: "",
                    pfpUrl: "",
                    location: "",
                    daysSwum: 0,
                    totalDistance: 0,
                    totalDuration: 0,
                    level: 0,
                    exp: 0,
                    streak: 0,
                    goal: "",
                    age: "",
                    gender: "",
                    profilePublic: false,
                });
            } else {
                // Awards 5 experience points to the existing profile (making sure the Profile and User documents hold the same number of exp
                await updateDoc(profileRef, {
                    exp: increment(5),
                });
            }

            // Saves the user's ID so other pages can identify the signed-in user account
            localStorage.setItem("loggedInUserId", user.uid);

            // Checks which setup page the user needs to complete before accessing the main page (if first sign-in go through all pages, if did not complete all information pages go through pages not complete and if completed all go directly to main page)
            await checkUserInfo(user);
            // Handles errors from Google sign-in or the account setup process
        } catch (error) {
            console.error("GOOGLE LOGIN ERROR:", error);

            if (error && error.code) {
                console.error("ERROR CODE:", error.code);
            }

            customAlert("Unable to sign in with Google.");
        }
    });
}

// Displays a temporary message using the custom alert elements on the page (HTML).
function customAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertText = document.getElementById("alertText");

    // Make sure both alert elements exist
    if (!alertBox || !alertText) {
        console.log(message);
        return;
    }

    // Updates the message and displays the alert box
    alertText.textContent = message;
    alertBox.style.display = "block";

    // Automatically hides the alert box after three seconds
    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000);
}

// Function to ensure user filled out about you page, if yes, skips the page
// Checks the user's setup progress and redirects them to the next required page.
async function checkUserInfo(user) {
    const docRef = doc(db, "users", user.uid);

    const docSnap = await getDoc(docRef);

    // Check if it exists
    // Stops if the user's data document is not found
    if (!docSnap.exists()) {
        return;
    }
    const userData = docSnap.data();

    // Send user to credentials page if they have not completed their credentials.
    if (!userData.credentialsCompleted) {
        window.location.href = "index-user-credentials.html";
        return;
    }

    // Send user to about you page if they have not completed their personal information.
    if (!userData.aboutYouCompleted) {
        window.location.href = "index-about-you-page.html";
        return;
    }

    // Send user to reason for swimming page if they have not provided their reason for swimming.
    if (!userData.whatReasonCompleted) {
        window.location.href = "index-reason-swimming-page.html";
        return;
    }

    // Send user to what goal page if they have not selected their swimming goal.
    if (!userData.yourGoalCompleted) {
        window.location.href = "index-what-goal-page.html";
        return;
    }

    // Send user to all set page if they have not completed the final setup page.
    if (!userData.allSetPageCompleted) {
        window.location.href = "index-all-set-page.html";
        return;
    }

    // Everything completed (after all information pages are completed, user will always be sent to main page after signing in
    // Send user to the main page when every setup section is completed
    window.location.href = "index-main-page.html";
}

// Finds the sign-up button on the current page (HTML)
const signUp = document.getElementById("submitSignUp");
// Checks whether the sign-up button exists before adding its click event
if (signUp) {
    // Runs the registration process when the user clicks the sign-up button
    signUp.addEventListener("click", (event) => {
        // When signUp button is clicked, it prevent page refresh, gets user info
        event.preventDefault();
        const email = document.getElementById("rEmail").value.trim().toLowerCase();
        const password = document.getElementById("rPassword").value;
        const firstName = document.getElementById("fName").value.trim();

        // Creates a Firebase Authentication account using the entered email and password
        createUserWithEmailAndPassword(auth, email, password)
            // Continues after Firebase successfully creates account
            .then(async (userCredential) => {
                // userCredentials are uid and email
                const user = userCredential.user; // user is now seen as the uid
               // Stores the user's starting account details and progress values
                const userData = {
                    // Creates user data
                    email: email,
                    firstName: firstName,
                    provider: "password",
                    myDistance: 0,
                    myHours: 0,
                    mySessions: 0,
                    myAttempts: 0,
                    lastSessionDate: "",
                    username: "",
                    level: 0,
                    exp: 0,
                    lastStreakDate: "",
                    streak: 0,
                    credentialsCompleted: false,
                    aboutYouCompleted: false,
                    whatReasonCompleted: false,
                    yourGoalCompleted: false,
                    allSetPageCompleted: false,
                    dayNumber: 1,
                    completedDays: 0,
                    lastCompletedDay: "",
                    startDate: new Date().toISOString(), //Example: "2026-07-19T14:30:00.000Z"
                };
                customAlert("Account Created Successfully"); // Show message that account was created sussessfully
                const docRef = doc(db, "users", user.uid);

                // Checks if the user's personal information document already exists
                const docSnap = await getDoc(docRef);

                // Saves the starting user data if the document has not been created yet
                if (!docSnap.exists()) {
                    await setDoc(docRef, userData);
                }
                // Creates a reference to the user's profile document
                const profileRef = doc(db, "profiles", user.uid);

                // Initializes the user's profile with its default values
                await setDoc(profileRef, {
                    username: "",
                    pfpUrl: "",
                    location: "",
                    daysSwum: 0,
                    totalDistance: 0,
                    totalDuration: 0,
                    level: 0,
                    exp: 0,
                    streak: 0,
                    goal: "",
                    age: "",
                    gender: "",
                    profilePublic: false,
                });
// Send the user to the login page after successfully creating their account.
                window.location.href = "index-login-page.html";
            })
            // Handles errors that occur during account registration
            .catch((error) => {
                const errorCode = error.code;
                // Checks if the email is already associated with another Firebase saved account
                if (errorCode == "auth/email-already-in-use") {
                    customAlert("Email Address Already Exists !!!");
                } else {
                    customAlert("unable to create User");
                }
            });
    });
}
// Finds the sign-in button on the current page (HTML)
const signIn = document.getElementById("submitSignIn");

// Checks whether the sign-in button exists before adding its click event
if (signIn) {
    // Runs the login process when the user clicks the sign-in button
    signIn.addEventListener("click", async (event) => {
       // Prevents the form from refreshing the webpage
        event.preventDefault();

        // Attempts to authenticate the user using their email and password
        try {
            const email = document.getElementById("email").value.trim().toLowerCase();

            const password = document.getElementById("password").value;

            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;

            localStorage.setItem("loggedInUserId", user.uid);

            // USER DOCUMENT
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // Retrieves the user's personal information document to update their exp points
            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    exp: increment(5),
                });
            }

            // PROFILE DOCUMENT
            const profileRef = doc(db, "profiles", user.uid);
            const profileSnap = await getDoc(profileRef);

            // Retrieves the user's profile document to update its exp points
            if (profileSnap.exists()) {
                await updateDoc(profileRef, {
                    exp: increment(5),
                });
            }

            // Check which page the user should go to
            await checkUserInfo(user);
            // Handles authentication errors and displays the appropriate message
        } catch (error) {
            console.log("LOGIN ERROR:", error.code);
            console.log("LOGIN MESSAGE:", error.message);

            if (error.code === "auth/invalid-credential") {
                customAlert("Incorrect email or password.");
            } else if (error.code === "auth/invalid-email") {
                customAlert("Please enter a valid email.");
            } else if (error.code === "auth/user-disabled") {
                customAlert("This account has been disabled.");
            } else if (error.code === "auth/too-many-requests") {
                customAlert("Too many attempts. Please try again later.");
            } else {
                customAlert("Unable to sign in. Check the browser console.");
            }
        }
    });
}

// Returns today's date in YYYY-MM-DD format for use as a daily activity document ID
function getTodayDate() {
   
    // Get the current year, month, and day from the Date object.
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Combines the year, month, and day into one formatted date string that can be displayed
    return year + "-" + month + "-" + day;
}

// Monitors Firebase Authentication to determine whether a user is signed in
// Runs whenever the authentication state has changed
onAuthStateChanged(auth, async (user) => {
    // Stops the process if nobody is currently signed in
    if (!user) {
        console.log("No user is signed in.");
        return;
    }

    console.log("Signed-in user:", user.uid);
// Makes sure the community totals document exists before continuing  
    await createCommunityTotals();

    const today = getTodayDate(); // Get today's date in YYYY-MM-DD format

    // Creates a reference to the current user's activity document using today's date as its ID (allows the subcollection to be easily accessible via date to allow date tracker graphs to work effectively) ex. 2026-06-21 
    const activityRef = doc(db, "users", user.uid, "activity", today);

    // Attempts to retrieve or initialize the user's daily swimming activity document
    try {
        const activitySnap = await getDoc(activityRef);

// Checks whether an activity document for today's date already exists
// The document is named after the date so that way if a document with the same date exists it will not create another one (no duplicates), however if date is not saved in a document it will create one (making a new document for a new day)
        if (!activitySnap.exists()) {
            // Creates a new daily activity document with default values if one does not exist
            await setDoc(activityRef, {
                date: today,
                distance: 0,
                duration: 0,
                sessions: 0,
            });

            console.log("ACTIVITY DOCUMENT CREATED!");
        } else {
            // Leaves the existing document unchanged if today's activity has already been initialized
            console.log("Activity document already exists.");
        }
        // Handles errors that occur while retrieving or creating the daily activity document
    } catch (error) {
        console.error("ACTIVITY ERROR:", error);
    }
});
