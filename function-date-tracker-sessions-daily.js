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

// Create the sessions chart
const chartCanvas = document.getElementById("sessions-chart");
const sessionsChart = new Chart(chartCanvas, {
  type: "bar",
  data: {
    labels: [""],
    datasets: [
      {
        label: "Sessions",
        data: [0],
        // Colour inside the bar
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        // Colour around the bar
        borderColor: "#f7f9fb",
        // Thickness of the border
        borderWidth: 2,
        barPercentage: 0.7,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Daily Sessions", color: "white" },
      tooltip: {
        callbacks: {
          label: function (context) {
            return "Sessions: " + context.parsed.y;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Sessions (#)",
          color: "white",
          font: { size: 12, weight: "bold" },
        },
        // Show whole numbers in white
        ticks: { color: "white", stepSize: 1, precision: 0 },
        // Horizontal gridlines
        grid: { color: "white" },
      },
      x: {
        title: { color: "white", display: false },
        ticks: { color: "white" },
      },
    },
  },
});
// Update the chart when the number of sessions changes
function drawStuff(sessions) {
  sessionsChart.data.datasets[0].data = [sessions];
  sessionsChart.update();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("No user is signed in.");
    document.getElementById("total-sessions").value = 0;
    drawStuff(0);
    return;
  }

  // Get this user's activity
  const activityRef = collection(db, "users", user.uid, "activity");
  const snapshot = await getDocs(activityRef);

  let displayedDate = new Date();

  const dateButton = document.getElementById("dateButton");

  const dateSelection = document.getElementById("dateSelected");

  // Function to format the visible date
  function updateDateButton(date) {
    document.getElementById("dateText").textContent = date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );
  }

  // Click the visible button
  dateButton.addEventListener("click", () => {
    if (typeof dateSelection.showPicker === "function") {
      dateSelection.showPicker();
    }
  });

  // When the user selects a date
  dateSelection.addEventListener("change", function () {
    const selectedDate = new Date(this.value + "T00:00:00");

    displayedDate = selectedDate;

    // Update visible button
    updateDateButton(displayedDate);

    // Load selected day's data
    loadDay(displayedDate);
  });

  const backButton = document.getElementById("back-picture");

  backButton.addEventListener("click", function () {
    // Go back one day
    displayedDate.setDate(displayedDate.getDate() - 1);

    // Load that day's data
    loadDay(displayedDate);
  });

  const forwardButton = document.getElementById("forward-picture");

  forwardButton.addEventListener("click", function () {
    displayedDate.setDate(displayedDate.getDate() + 1);

    loadDay(displayedDate);
  });

  function loadDay(date) {
    // Update the date picker to match the date being displayed
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    document.getElementById("dateSelected").value =
      year + "-" + month + "-" + day;

    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
    // Update the visible date button
    document.getElementById("dateText").textContent = date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );

    let found = false;

    // Go through all Firestore activity documents
    snapshot.forEach((activityDoc) => {
      const data = activityDoc.data();

      // Check that the activity has a date
      if (!data.date) {
        return;
      }
      // Convert Firestore date into a Date object
      const [year, month, day] = data.date.split("-");

      const activityDate = new Date(year, month - 1, day);
      // Compare the year, month, and day
      if (
        activityDate.getFullYear() === date.getFullYear() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getDate() === date.getDate()
      ) {
        found = true;

        // We found the correct day
        console.log("Found:", data);

        const sessions = Number(data.sessions) || 0;

        // Put the distance into the HTML
        document.getElementById("total-sessions").value = sessions;

        // Put the distance into the graph
        drawStuff(sessions);
      }
    });
    if (!found) {
      document.getElementById("total-sessions").value = 0;
      drawStuff(0);
    }
  }
  loadDay(displayedDate);
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
