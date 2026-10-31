let settings = document.getElementById("settings-box");

function callSettingsPage() {
  window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);

// Import firebase
// Import Firebase app to link this website to Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

// Import Firestore and functions used to access and update user data within
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Import Firebase Authentication
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

// Initialize firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Create the weekly sessions chart
let sessionsChart = null;

// Store the daily sessions
let dailySessionsForChart = [];

// Draw the weekly sessions graph
function drawSessionsChart(dailySessions) {
  // Store the daily session values
  dailySessionsForChart = dailySessions.slice();

  // Get the chart canvas
  const canvas = document.getElementById("weekly-sessions-chart");

  // Check that the canvas exists
  if (!canvas) {
    console.log("Weekly sessions chart canvas was not found.");
    return;
  }

  // Create the graph if it does not exist yet
  if (sessionsChart === null) {
    sessionsChart = new Chart(canvas, {
      type: "bar",

      data: {
        labels: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],

        datasets: [
          {
            label: "Sessions",
            data: dailySessions,
            backgroundColor: "rgba(100, 181, 246, 0.7)",
            borderColor: "white",
            borderWidth: 1,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },

          title: {
            display: true,
            text: "Weekly Sessions",
            color: "white",
          },

          subtitle: {
            display: false,
            text: "Your session count across the week.",
            color: "white",
          },
        },

        scales: {
          x: {
            ticks: {
              color: "white",
            },
          },

          y: {
            beginAtZero: true,

            ticks: {
              color: "white",
              stepSize: 1,
            },

            title: {
              display: true,
              text: "Sessions (#)",
              color: "white",
            },
          },
        },
      },
    });
  } else {
    // Update the graph when the selected week changes
    sessionsChart.data.datasets[0].data = dailySessions;

    sessionsChart.update();
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("No user is signed in.");
    return;
  }
  // Get this user's activity
  const activityRef = collection(db, "users", user.uid, "activity");

  const snapshot = await getDocs(activityRef);

  // This represents the week being displayed
  let displayedDate = new Date();
  const dateButton = document.getElementById("dateButton");
  const weekSelection = document.getElementById("dateSelected");

  // Convert a date into the ISO week input format: YYYY-W##
  function getWeekInputValue(date) {
    const tempDate = new Date(date);

    // Find Thursday of the current ISO week
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));

    // Get the ISO week year
    const year = tempDate.getFullYear();

    // Find the first Thursday of the ISO week year
    const januaryFourth = new Date(year, 0, 4);

    const firstThursday = new Date(januaryFourth);

    firstThursday.setDate(
      januaryFourth.getDate() + 3 - ((januaryFourth.getDay() + 6) % 7),
    );

    // Calculate the ISO week number
    const weekNumber =
      1 + Math.round((tempDate - firstThursday) / (7 * 24 * 60 * 60 * 1000));

    // Add a 0 if the week number is less than 10
    let weekText = weekNumber;

    if (weekNumber < 10) {
      weekText = "0" + weekNumber;
    }

    return year + "-W" + weekText;
  }

  // Convert YYYY-W## into the Sunday of the selected ISO week
  function getDateFromWeek(weekValue) {
    const parts = weekValue.split("-W");

    const year = Number(parts[0]);
    const week = Number(parts[1]);

    // January 4 is always in ISO week 1
    const januaryFourth = new Date(year, 0, 4);

    // Find the Monday of ISO week 1
    const firstMonday = new Date(januaryFourth);

    firstMonday.setDate(
      januaryFourth.getDate() - ((januaryFourth.getDay() + 6) % 7),
    );

    // Find the Monday of the selected ISO week
    const selectedMonday = new Date(firstMonday);

    selectedMonday.setDate(firstMonday.getDate() + (week - 1) * 7);

    // Move back one day to Sunday
    selectedMonday.setDate(selectedMonday.getDate() - 1);

    // Set the time to midnight
    selectedMonday.setHours(0, 0, 0, 0);

    return selectedMonday;
  }

  // Update the visible week text
  function updateDateButton(startOfWeek, endOfWeek) {
    document.getElementById("dateText").textContent =
      startOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) +
      " – " +
      endOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  }

  // When the user selects a week
  weekSelection.addEventListener("change", function () {
    const selectedWeek = this.value;

    // Convert selected week into a date
    displayedDate = getDateFromWeek(selectedWeek);

    // Load the selected week
    loadWeek(displayedDate);
  });

  // Open the week picker when the button is clicked
  dateButton.addEventListener("click", () => {
    weekSelection.showPicker();
  });

  const backButton = document.getElementById("back-picture");

  backButton.addEventListener("click", function () {
    // Go back one week
    displayedDate.setDate(displayedDate.getDate() - 7);

    // Load that week's data
    loadWeek(displayedDate);
  });

  const forwardButton = document.getElementById("forward-picture");

  forwardButton.addEventListener("click", function () {
    // Go forward one week
    displayedDate.setDate(displayedDate.getDate() + 7);

    // Load that week's data
    loadWeek(displayedDate);
  });

  function loadWeek(date) {
    // Find the Sunday of this week
    const startOfWeek = new Date(date);

    startOfWeek.setDate(date.getDate() - date.getDay());

    startOfWeek.setHours(0, 0, 0, 0);

    // Find the Saturday of this week
    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 6);

    endOfWeek.setHours(23, 59, 59, 999);

    // Update the week input
    weekSelection.value = getWeekInputValue(startOfWeek);

    // Update visible week
    updateDateButton(startOfWeek, endOfWeek);

    let totalSessions = 0;

    // Store distance for each day
    let dailySessions = [0, 0, 0, 0, 0, 0, 0];

    // Go through all Firestore activity documents
    snapshot.forEach((activityDoc) => {
      const data = activityDoc.data();

      // Check that the activity has a date
      if (!data.date) {
        return;
      }

      // Convert the Firestore date into a Date object
      const [year, month, day] = data.date.split("-");

      const activityDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
      );
      // Make sure activityDate only uses the date
      activityDate.setHours(0, 0, 0, 0);

      // Check if activity is inside this week
      if (activityDate >= startOfWeek && activityDate <= endOfWeek) {
        // Get the number of sessions from Firestore
        let sessions = Number(data.sessions);

        // Make sure sessions is a valid, non-negative number
        if (isNaN(sessions) || sessions < 0) {
          sessions = 0;
        }

        // Add to weekly total
        totalSessions += sessions;

        // Get the day of the week
        const dayNumber = activityDate.getDay();

        // Add sessions to that day
        dailySessions[dayNumber] += sessions;
      }
    });

    // Put total distance into HTML
    document.getElementById("total-sessions").value = totalSessions;

    // Calculate average distance
    const averageSessions = totalSessions / 7;

    document.getElementById("average-sessions").value =
      averageSessions.toFixed(2);

    // Draw the graph
    drawSessionsChart(dailySessions);
  }
  // Set the week input to the current week
  weekSelection.value = getWeekInputValue(displayedDate);

  // Load the current week when the page opens
  loadWeek(displayedDate);
});

const dropdown = document.getElementById("date-tracker-details");

dropdown.addEventListener("change", function () {
  const selectedValue = this.value;

  if (selectedValue === "Distance") {
    window.location.href = "index-date-tracker-distance-daily.html";
  } else if (selectedValue === "Duration") {
    window.location.href = "index-date-tracker-duration-daily.html";
  } else if (selectedValue === "Session") {
    window.location.href = "index-date-tracker-sessions-daily.html";
  }
});
