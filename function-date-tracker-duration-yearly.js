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

// Store the yearly duration chart
let yearlyDurationChart = null;
// Draw or update the yearly duration graph
function drawYearlyDurationChart(monthlyDurations, unit) {
  const canvas = document.getElementById("yearly-duration-chart");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Store the graph values in the selected unit
  let convertedDurations = [];
  for (let i = 0; i < monthlyDurations.length; i++) {
    if (unit === "Minutes") {
      convertedDurations.push(monthlyDurations[i] * 60);
    } else {
      convertedDurations.push(monthlyDurations[i]);
    }
  }
  // Set the graph title and axis label
  let graphTitle = "Yearly Duration";
  let axisTitle = "Duration (hrs)";
  if (unit === "Minutes") {
    graphTitle = "Yearly Duration";
    axisTitle = "Duration (min)";
  } // Create the graph the first time
  if (yearlyDurationChart === null) {
    yearlyDurationChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: axisTitle,
            data: convertedDurations,
            backgroundColor: "rgba(0, 123, 255, 0.5)",
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
            text: graphTitle,
            color: "white",
            font: { size: 16 },
          },
        },
        scales: {
          x: { ticks: { color: "white" }, grid: { display: false } },
          y: {
            beginAtZero: true,
            title: { display: true, text: axisTitle, color: "white" },
            ticks: { color: "white" },
          },
        },
      },
    });
  } else {
    // Update the existing graph
    yearlyDurationChart.data.labels = months;
    yearlyDurationChart.data.datasets[0].data = convertedDurations;
    yearlyDurationChart.data.datasets[0].label = axisTitle;
    yearlyDurationChart.options.plugins.title.text = graphTitle;
    yearlyDurationChart.options.scales.y.title.text = axisTitle;
    yearlyDurationChart.update();
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

  // This represents the year being displayed
  let displayedDate = new Date();

  const backButton = document.getElementById("back-picture");

  backButton.addEventListener("click", function () {
    // Go back one year
    displayedDate.setFullYear(displayedDate.getFullYear() - 1);

    // Load that year's data
    loadYear(displayedDate);
  });

  const forwardButton = document.getElementById("forward-picture");

  forwardButton.addEventListener("click", function () {
    // Go forward one year
    displayedDate.setFullYear(displayedDate.getFullYear() + 1);

    // Load that year's data
    loadYear(displayedDate);
  });

  let duration = 0;

  // Store the monthly durations for the graph
  let monthlyDurationsForChart = [];

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
    // Update the graph when the unit changes
    drawYearlyDurationChart(monthlyDurationsForChart, unit);
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
  function loadYear(date) {
    // Find the year being displayed
    const year = date.getFullYear();

    // Display the year at the top
    document.getElementById("current-date").textContent = year;

    let totalDuration = 0;

    // Store duration for each month
    let monthlyDurations = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    snapshot.forEach((activityDoc) => {
      const data = activityDoc.data();
      // Skip documents without a date or duration
      if (!data.date || data.duration == null) {
        return;
      }
      // Convert the Firestore date into a Date object
      const [activityYear, month, day] = data.date.split("-").map(Number);
      const activityDate = new Date(activityYear, month - 1, day);
      // Check if the activity belongs to this year
      if (activityDate.getFullYear() === year) {
        // Duration is stored in hours
        const durationValue = Number(data.duration) || 0;
        // Add to the yearly total
        totalDuration += durationValue;
        // Find the month
        const monthNumber = activityDate.getMonth();
        // Add the duration to that month
        monthlyDurations[monthNumber] += durationValue;
      }
    });
    // Save the monthly durations so the graph can update when the unit changes
    monthlyDurationsForChart = monthlyDurations;

    duration = totalDuration;

    averageDuration = totalDuration / 12;

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

    // Draw the graph using the selected unit
    drawYearlyDurationChart(monthlyDurationsForChart, unitSelection.value);
  }

  // Load the current year when the page opens
  loadYear(displayedDate);
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
