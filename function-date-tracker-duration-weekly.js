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
  appId: "1:879740645963:web",
};

// Initialize firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Create the weekly duration chart
let durationChart = null;
// Store the original daily durations in hours
let dailyDurationsForChart = [];
// Draw the weekly duration graph
function drawDurationChart(dailyDurations) {
  // Store the original durations in hours
  dailyDurationsForChart = dailyDurations.slice();
  // Get the chart canvas
  const canvas = document.getElementById("weekly-duration-chart");
  // Check that the canvas exists
  if (!canvas) {
    console.log("Weekly duration chart canvas was not found.");
    return;
  }
  // Get the selected unit
  const unitSelection = document.getElementById("unit-details");
  const unit = unitSelection.value;
  // Store the displayed durations
  let graphDurations = [];
  // Convert the values for display
  for (let i = 0; i < dailyDurationsForChart.length; i++) {
    if (unit === "Minutes") {
      graphDurations.push(dailyDurationsForChart[i] * 60);
    } else {
      graphDurations.push(dailyDurationsForChart[i]);
    }
  }
  // Set the graph's unit label
  let unitText = "hrs";
  if (unit === "Minutes") {
    unitText = "min";
  }
  // Create the graph if it does not exist yet
  if (durationChart === null) {
    durationChart = new Chart(canvas, {
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
            label: "Duration (" + unitText + ")",
            data: graphDurations,
            backgroundColor: "rgba(100, 181, 246, 0.7)",
            borderColor: "#f7f9fb",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Weekly Duration",
            color: "white",
          },
        },
        scales: {
          x: { ticks: { color: "white" } },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Duration (" + unitText + ")", color: "white" },
            ticks: { color: "white" },
          },
        },
      },
    });
  } else {
    // Update the graph when the selected week or unit changes
    durationChart.data.datasets[0].data = graphDurations;
    // Update the graph labels
    durationChart.data.datasets[0].label = "Duration (hrs)";
    durationChart.options.plugins.title.text =
      "Weekly Duration (" + unitText + ")";
    durationChart.options.scales.y.title.text = unitText;
    durationChart.update();
  }
}
// Update the graph when the unit changes
const chartUnitSelection = document.getElementById("unit-details");
chartUnitSelection.addEventListener("change", function () {
  drawDurationChart(dailyDurationsForChart);
});

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

  // Convert a date into the format required by the week input
  function getWeekInputValue(date) {
    const tempDate = new Date(date);

    // Find Sunday of the selected week
    tempDate.setDate(tempDate.getDate() - tempDate.getDay());

    // Find the year
    const year = tempDate.getFullYear();

    // Find the first Sunday of the year
    const firstSunday = new Date(year, 0, 1);

    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

    // Calculate the week number
    const daysPassed = tempDate.getTime() - firstSunday.getTime();

    const weekNumber = Math.floor(daysPassed / (7 * 24 * 60 * 60 * 1000)) + 1;

    // Add a zero if the week number is less than 10
    let weekText = weekNumber;

    if (weekNumber < 10) {
      weekText = "0" + weekNumber;
    }

    return year + "-W" + weekText;
  }

  // Convert YYYY-W## into the Sunday of that week
  function getDateFromWeek(weekValue) {
    const parts = weekValue.split("-W");

    const year = Number(parts[0]);
    const week = Number(parts[1]);

    // January 1st
    const januaryFirst = new Date(year, 0, 1);

    // Find the first Sunday
    const firstSunday = new Date(januaryFirst);

    firstSunday.setDate(januaryFirst.getDate() - januaryFirst.getDay());

    // Find the Sunday of the selected week
    const selectedSunday = new Date(firstSunday);

    selectedSunday.setDate(firstSunday.getDate() + (week - 1) * 7);

    // Set the time to midnight
    selectedSunday.setHours(0, 0, 0, 0);

    return selectedSunday;
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

  let duration = 0;

  let durationDisplay = document.getElementById("total-duration");

  const unitSelection = document.getElementById("unit-details");

  unitSelection.addEventListener("change", function () {
    const unit = this.value;

    let displayedDuration = duration;

    if (unit === "Minutes") {
      displayedDuration = duration * 60;
    } else if (unit === "Hours") {
      displayedDuration = duration;
    }

    durationDisplay.value = displayedDuration.toFixed(2);
  });

  let averageDuration = 0;

  let averageDurationDisplay = document.getElementById("average-duration");

  const averageUnitSelection = document.getElementById("average-unit-details");

  averageUnitSelection.addEventListener("change", function () {
    const averageUnit = this.value;

    let displayedAverageDuration = averageDuration;

    if (averageUnit === "Minutes") {
      displayedAverageDuration = averageDuration * 60;
    } else if (averageUnit === "Hours") {
      displayedAverageDuration = averageDuration;
    }

    averageDurationDisplay.value = displayedAverageDuration.toFixed(2);
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

    let totalDuration = 0;

    // Store duration for each day
    let dailyDurations = [0, 0, 0, 0, 0, 0, 0];

    // Go through all Firestore activity documents
    snapshot.forEach((activityDoc) => {
      const data = activityDoc.data();

      // Convert Firestore date into a Date object
      const [year, month, day] = data.date.split("-");

      const activityDate = new Date(year, month - 1, day);

      // Make sure activityDate only uses the date
      activityDate.setHours(0, 0, 0, 0);

      // Check if activity is inside this week
      if (activityDate >= startOfWeek && activityDate <= endOfWeek) {
        // Firestore stores duration in hours
        let durationValue = Number(data.duration);

        // Check that the duration is valid
        if (isNaN(durationValue) || durationValue < 0) {
          durationValue = 0;
        }

        // Add duration to weekly total
        totalDuration += durationValue;

        // Get the day of the week
        const dayNumber = activityDate.getDay();

        // Add duration to that day
        dailyDurations[dayNumber] += durationValue;
      }
    });

    duration = totalDuration;

    // Calculate average duration
    averageDuration = totalDuration / 7;

    const unit = unitSelection.value;

    let displayedDuration = duration;

    if (unit === "Minutes") {
      displayedDuration = duration * 60;
    } else if (unit === "Hours") {
      displayedDuration = duration;
    }

    durationDisplay.value = displayedDuration.toFixed(2);

    const averageUnit = averageUnitSelection.value;

    let displayedAverageDuration = averageDuration;

    if (averageUnit === "Minutes") {
      displayedAverageDuration = averageDuration * 60;
    } else if (averageUnit === "Hours") {
      displayedAverageDuration = averageDuration;
    }

    averageDurationDisplay.value = displayedAverageDuration.toFixed(2);

    // Store the daily durations in hours
    dailyDurationsForChart = dailyDurations;

    // Draw the graph using Chart.js
    drawDurationChart(dailyDurations);
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
