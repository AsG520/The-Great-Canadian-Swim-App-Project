// Basically, allows user to create an account (e.g. email/password, Google) and creates the storage base for data handling.

// Import the functions you need from the SDKs you need
// Imports the Firebase App to allow connect of Firebase to project.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js"; // Imports firebase connection tools
import { getFirestore, setDoc, updateDoc, doc, getDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"; // connects to Firebase's database, Firebase stores UID, Email and password, while Firestore holds other info
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// Follow another user
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

// Creates a collection in Firestore (initalized only when not previously created) to store community(all users) collected data
async function createCommunityTotals() {
    const communityRef = doc(db, "community", "totals");
    // Checks if the document exists already
    const communitySnap = await getDoc(communityRef);

    // if statement that when it does not exist it creates the collection and give it values for each statistic
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

const forgotPassword = document.getElementById("forgot-password-word");
console.log(forgotPassword);
if (forgotPassword) {
    forgotPassword.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim().toLowerCase();

        if (!email) {
            customAlert("Please enter your email first.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email); //video: https://www.youtube.com/watch?v=XpMnUNWMyQI

            customAlert("Password reset email sent. Check your inbox. (It may appear in Spam/Trash)");
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
// google stuff

const googleProvider = new GoogleAuthProvider(); // link: https://firebase.google.com/docs/auth/web/google-signin?utm_source

googleProvider.setCustomParameters({
    prompt: "select_account",
});

const googleSignIn = document.getElementById("googleSignIn");

if (googleSignIn) {
    googleSignIn.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);

            const user = result.user;

            let firstName = "N/A";
            let lastName = "N/A";

            if (user.displayName) {
                const name = user.displayName.split(" ");

                firstName = name[0];

                if (name[1]) {
                    lastName = name[1];
                }
            }

            // USER DOCUMENT
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

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
                await updateDoc(userRef, {
                    provider: "google",
                    exp: increment(5),
                });
            }

            // PROFILE DOCUMENT
            const profileRef = doc(db, "profiles", user.uid);
            const profileSnap = await getDoc(profileRef);

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
                await updateDoc(profileRef, {
                    exp: increment(5),
                });
            }

            localStorage.setItem("loggedInUserId", user.uid);

            await checkUserInfo(user);
        } catch (error) {
            console.error("GOOGLE LOGIN ERROR:", error);

            if (error && error.code) {
                console.error("ERROR CODE:", error.code);
            }

            customAlert("Unable to sign in with Google.");
        }
    });
}

//const analytics = getAnalytics(app);

function customAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertText = document.getElementById("alertText");

    // Make sure both elements exist
    if (!alertBox || !alertText) {
        console.log(message);
        return;
    }

    alertText.textContent = message;
    alertBox.style.display = "block";

    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000);
}

// Function to ensure user filled out about you page, if yes, skips the page
async function checkUserInfo(user) {
    const docRef = doc(db, "users", user.uid);

    const docSnap = await getDoc(docRef);

    // Check if it exists
    if (!docSnap.exists()) {
        return;
    }
    const userData = docSnap.data();

    if (!userData.credentialsCompleted) {
        window.location.href = "index-user-credentials.html";
        return;
    }

    if (!userData.aboutYouCompleted) {
        window.location.href = "index-about-you-page.html";
        return;
    }

    if (!userData.whatReasonCompleted) {
        window.location.href = "index-reason-swimming-page.html";
        return;
    }

    if (!userData.yourGoalCompleted) {
        window.location.href = "index-what-goal-page.html";
        return;
    }

    if (!userData.allSetPageCompleted) {
        window.location.href = "index-all-set-page.html";
        return;
    }

    // Everything completed
    window.location.href = "index-main-page.html";
}

const signUp = document.getElementById("submitSignUp");
if (signUp) {
    signUp.addEventListener("click", (event) => {
        // When signUp button is clicked, it prevent page refresh, gets user info
        event.preventDefault();
        const email = document.getElementById("rEmail").value.trim().toLowerCase();
        const password = document.getElementById("rPassword").value;
        const firstName = document.getElementById("fName").value.trim();

        //creates firebase account
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // userCredentials are uid and email
                const user = userCredential.user; // user is now seen as the uid
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

                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    await setDoc(docRef, userData);
                }
                const profileRef = doc(db, "profiles", user.uid);

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

                window.location.href = "index-login-page.html";
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode == "auth/email-already-in-use") {
                    customAlert("Email Address Already Exists !!!");
                } else {
                    customAlert("unable to create User");
                }
            });
    });
}

const signIn = document.getElementById("submitSignIn");

if (signIn) {
    signIn.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            const email = document.getElementById("email").value.trim().toLowerCase();

            const password = document.getElementById("password").value;

            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;

            localStorage.setItem("loggedInUserId", user.uid);

            // USER DOCUMENT
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    exp: increment(5),
                });
            }

            // PROFILE DOCUMENT
            const profileRef = doc(db, "profiles", user.uid);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                await updateDoc(profileRef, {
                    exp: increment(5),
                });
            }

            // Check which page the user should go to
            await checkUserInfo(user);
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

function getTodayDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

// Wait for Firebase to determine the signed-in user
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("No user is signed in.");
        return;
    }

    console.log("Signed-in user:", user.uid);
    // Runs function when page loads
    await createCommunityTotals();

    const today = getTodayDate(); // Get today's date in YYYY-MM-DD format

    const activityRef = doc(db, "users", user.uid, "activity", today);

    try {
        const activitySnap = await getDoc(activityRef);

        // Everyday the document date changes so the name of the document does not match
        if (!activitySnap.exists()) {
            await setDoc(activityRef, {
                date: today,
                distance: 0,
                duration: 0,
                sessions: 0,
            });

            console.log("ACTIVITY DOCUMENT CREATED!");
        } else {
            console.log("Activity document already exists.");
        }
    } catch (error) {
        console.error("ACTIVITY ERROR:", error);
    }
});
