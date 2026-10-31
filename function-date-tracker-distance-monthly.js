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

// Store the monthly distance chart
let distanceChart = null;

// Store daily distances in kilometres for the graph
let dailyDistancesForChart = [];

// Draw the monthly distance graph
function drawDistanceChart(dailyDistances, unit) {
  // Get the chart canvas
  const canvas = document.getElementById("monthly-distance-chart");

  // Check that the canvas exists
  if (!canvas) {
    console.log("Monthly distance chart canvas was not found.");
    return;
  }

  // Copy the distances so the original kilometre values do not change
  let graphDistances = dailyDistances.slice();

  // Convert the graph values to metres if necessary
  if (unit === "Meters") {
    for (let i = 0; i < graphDistances.length; i++) {
      graphDistances[i] = graphDistances[i] * 1000;
    }
  }

  // Set the graph labels
  let graphUnit = "km";

  if (unit === "Meters") {
    graphUnit = "m";
  }

  // Create the graph if it does not exist yet
  if (distanceChart === null) {
    distanceChart = new Chart(canvas, {
      type: "bar",

      data: {
        // Show the day number along the bottom
        labels: graphDistances.map((distance, index) => index + 1),

        datasets: [
          {
            label: "Distance (" + graphUnit + ")",
            data: graphDistances,
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
            text: "Monthly Distance (" + graphUnit + ")",
            color: "white",
          },

          subtitle: {
            display: false,
            text: "Your distance across the month by day.",
            color: "white",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Day of the Month",
              color: "white",
            },

            ticks: {
              color: "white",
            },
          },

          y: {
            beginAtZero: true,

            title: {
              display: true,
              text: "Distance (" + graphUnit + ")",
              color: "white",
            },

            ticks: {
              color: "white",
            },
          },
        },
      },
    });
  } else {
    // Update the graph when the month or unit changes
    distanceChart.data.labels = graphDistances.map(
      (distance, index) => index + 1,
    );

    distanceChart.data.datasets[0].data = graphDistances;
    distanceChart.data.datasets[0].label = "Distance (" + graphUnit + ")";

    // Update the graph's unit labels
    distanceChart.options.plugins.title.text =
      "Monthly Distance (" + graphUnit + ")";

    distanceChart.options.scales.y.title.text = "Distance (" + graphUnit + ")";

    // Refresh the graph
    distanceChart.update();
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("No user is signed in.");
    return;
  }

  // Get this user's activity
  const activityRef = collection(db, "users", user.uid, "activity");

  // Get all activity documents
  const snapshot = await getDocs(activityRef);

  // This represents the month being displayed
  let displayedDate = new Date();

  const dateButton = document.getElementById("dateButton");

  const monthSelection = document.getElementById("dateSelected");

  function updateDateButton(date) {
    document.getElementById("dateText").textContent = date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      },
    );
  }

  // When the user selects a month
  monthSelection.addEventListener("change", function () {
    const [year, month] = this.value.split("-");

    // Create a Date object for the selected month
    displayedDate = new Date(Number(year), Number(month) - 1, 1);

    // Update the visible button
    updateDateButton(displayedDate);

    // Load the selected month
    loadMonth(displayedDate);
  });

  // Set the month picker to the current month
  const currentYear = displayedDate.getFullYear();

  const currentMonth = String(displayedDate.getMonth() + 1).padStart(2, "0");

  monthSelection.value = currentYear + "-" + currentMonth;

  // Display the current month on the button
  updateDateButton(displayedDate);

  // Open the month picker when the button is clicked
  dateButton.addEventListener("click", () => {
    monthSelection.showPicker();
  });

  const backButton = document.getElementById("back-picture");

  backButton.addEventListener("click", function () {
    // Go back one month
    displayedDate = new Date(
      displayedDate.getFullYear(),
      displayedDate.getMonth() - 1,
      1,
    );

    // Load that month's data
    loadMonth(displayedDate);
  });

  const forwardButton = document.getElementById("forward-picture");

  forwardButton.addEventListener("click", function () {
    // Go forward one month
    displayedDate = new Date(
      displayedDate.getFullYear(),
      displayedDate.getMonth() + 1,
      1,
    );

    // Load that month's data
    loadMonth(displayedDate);
  });

  // Store the total distance in kilometres
  let distance = 0;

  // Get the total distance input
  let distanceDisplay = document.getElementById("total-distance");

  // Get the total distance unit dropdown
  const unitSelection = document.getElementById("unit-details");

  // Store the average distance in kilometres
  let averageDistance = 0;

  // Get the average distance input
  let averageDistanceDisplay = document.getElementById("average-distance");

  // Get the average distance unit dropdown
  const averageUnitSelection = document.getElementById("average-unit-details");

  // Display the total distance using the selected unit
  function updateTotalDistance() {
    let displayedDistance = distance;

    if (unitSelection.value === "Meters") {
      displayedDistance = distance * 1000;
    }

    distanceDisplay.value = displayedDistance.toFixed(2);
  }

  // Display the average distance using the selected unit
  function updateAverageDistance() {
    let displayedAverageDistance = averageDistance;

    if (averageUnitSelection.value === "Meters") {
      displayedAverageDistance = averageDistance * 1000;
    }

    averageDistanceDisplay.value = displayedAverageDistance.toFixed(2);
  }

  // Change the total distance when its unit is changed
  unitSelection.addEventListener("change", function () {
    updateTotalDistance();

    // Update the graph to use the selected total distance unit
    drawDistanceChart(dailyDistancesForChart, unitSelection.value);
  });

  // Change the average distance when its unit is changed
  averageUnitSelection.addEventListener("change", function () {
    updateAverageDistance();
  });

  function loadMonth(date) {
    // Update the month picker to match the displayed month
    const year = date.getFullYear();
    const month2 = String(date.getMonth() + 1).padStart(2, "0");

    document.getElementById("dateSelected").value = year + "-" + month2;
    updateDateButton(date);

    const month = date.getMonth();

    // Get the number of days in this month
    const numberOfDays = new Date(year, month + 1, 0).getDate();

    // Find the first day of the month
    const startOfMonth = new Date(year, month, 1);

    startOfMonth.setHours(0, 0, 0, 0);

    // Find the last day of the month
    const endOfMonth = new Date(year, month + 1, 0);

    endOfMonth.setHours(23, 59, 59, 999);

    let totalDistance = 0;

    let dailyDistances = new Array(numberOfDays).fill(0);

    // Go through all Firestore activity documents
    snapshot.forEach((activityDoc) => {
      const data = activityDoc.data();

      // Check that the activity has a date
      if (!data.date) {
        return;
      }

      // Convert Firestore date into a Date object
      const [activityYear, activityMonth, activityDay] = data.date.split("-");

      const activityDate = new Date(
        Number(activityYear),
        Number(activityMonth) - 1,
        Number(activityDay),
      );

      // Ignore invalid dates
      if (isNaN(activityDate.getTime())) {
        return;
      }

      // Check if activity is inside this month
      if (activityDate >= startOfMonth && activityDate <= endOfMonth) {
        // Firestore distance is stored in kilometres
        let distanceValue = Number(data.distance);

        // Make sure the distance is a valid, non-negative number
        if (isNaN(distanceValue) || distanceValue < 0) {
          distanceValue = 0;
        }

        // Add to the monthly total
        totalDistance += distanceValue;

        // Arrays start at 0, so subtract 1
        const dayNumber = activityDate.getDate() - 1;

        // Add the distance to that day
        dailyDistances[dayNumber] += distanceValue;
      }
    });

    // Store the monthly total in kilometres
    distance = totalDistance;

    // Calculate the average distance per day in kilometres
    averageDistance = totalDistance / numberOfDays;

    // Update the total distance using the selected unit
    updateTotalDistance();

    // Update the average distance using its selected unit
    updateAverageDistance();

    // Store daily distances in kilometres
    dailyDistancesForChart = dailyDistances.slice();

    // Draw the graph using the selected total distance unit
    drawDistanceChart(dailyDistancesForChart, unitSelection.value);
  }

  // Load the current month when the page opens
  loadMonth(displayedDate);
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
