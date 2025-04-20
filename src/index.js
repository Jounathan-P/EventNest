// Import Firebase SDKs
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc, query, where,
  updateDoc, getDoc, setDoc, getDocs, serverTimestamp
} from 'firebase/firestore';
import {
  getAuth, createUserWithEmailAndPassword,
  signOut, signInWithEmailAndPassword, onAuthStateChanged
} from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGtWIzrefSz12n86tWzbHnetUnHT3QFo8",
  authDomain: "eventnest-52826.firebaseapp.com",
  projectId: "eventnest-52826",
  storageBucket: "eventnest-52826.firebasestorage.app",
  messagingSenderId: "621756390258",
  appId: "1:621756390258:web:7a71692f79c503d2de1beb",
  measurementId: "G-8FXCZ7KZV3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Collection Reference
const usersCollection = collection(db, 'users');
const eventsCollection = collection(db, 'events');

// Realtime Snapshot Listener
onSnapshot(usersCollection, (snapshot) => {
  const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  console.log(users);
});

onSnapshot(eventsCollection, (snapshot) => {
  const events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  console.log(events);
});

/* Homepage Section */
// Menu Toggle Functionality
window.onload = function () {
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && menuClose && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.remove("hidden");
      mobileMenu.classList.add("flex");
    });

    menuClose.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      mobileMenu.classList.remove("flex");
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target === mobileMenu) {
        mobileMenu.classList.add("hidden");
        mobileMenu.classList.remove("flex");
      }
    });
  }
};

// Initialize Event Animations
function initializeEventAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0", "translate-y-10");
          entry.target.classList.add("opacity-100", "translate-y-0");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".featured-event").forEach(el => observer.observe(el));
}

// Initialize featured events on page load
document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedEvents();
  tabButtons[0]?.click(); // set default active tab
});

// Tab functionality
const tabButtons = document.querySelectorAll(".tab-btn");
const forms = document.querySelectorAll(".signup-form");

tabButtons.forEach(button => {
  button.addEventListener("click", function() {
    const target = this.getAttribute("data-target");

    // Hide all forms
    forms.forEach(form => form.classList.add("hidden"));
    tabButtons.forEach(btn => {
      btn.classList.remove("text-green-600", "border-green-500", "font-bold");
      btn.classList.add("text-gray-600", "border-transparent", "font-medium");
    });

    // Show selected form and higlight
    document.getElementById(`${target}-form`).classList.remove("hidden");
    this.classList.add("text-green-600", "border-green-500", "font-bold");
    this.classList.remove("text-gray-600", "border-transparent", "font-medium");
  });
});   

// adding user docs
document.addEventListener('DOMContentLoaded', (event) => {
  document.body.addEventListener('submit', async (e) => {
    if (e.target.matches('.add')){
      e.preventDefault()

      const forms = e.target;
      const role = forms.getAttribute("data-role");
      try {
        // Get common form data
        const formData = {
          name: forms.querySelector('[name="name"]').value,
          email: forms.querySelector('[name="email"]').value,
          password: forms.querySelector('[name="password"]').value,
          role: role,
          createdAt: new Date(),
        };
      
      // Add role-specific data
      switch (role) {
        case 'student':
          formData.studentId = forms.querySelector('[name="stuID"]').value;
          formData.department = forms.querySelector('[name="department"]').value;
          break;
        case 'organizer':
          formData.department = forms.querySelector('[name="department"]').value;
          formData.description = forms.querySelector('[name="description"]').value;
          break;
        case 'admin':
          formData.position = forms.querySelector('[name="position"]').value;
          formData.department = forms.querySelector('[name="department"]').value;
          break;
      }
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );

        // Store additional user data in Firestore
        const { password, ...userData } = formData;
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);

        // Set user ID in local storage
        localStorage.setItem('loggedInUserId', userCredential.user.uid);

        // Show success message
        alert('Account created successfully!');

        // Redirect based on role
        redirectUser('dashboard.html');

      } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'auth/email-already-in-use') {
          alert('Email address is already registered!');
        } else {
          alert('Error creating account. Please try again.');
        }
      }
    }
  });
});

// deleting docs
document.addEventListener('DOMContentLoaded', (event) => {
  document.body.addEventListener('submit', (e) => {
    if (e.target.matches('.delete')){
      e.preventDefault()
  
    const docRef = doc(db, 'users', deleteUserForm.id.value)
    
    deleteDoc(docRef)
      .then(() => {
        deleteUserForm.reset()
      })
    }
  })
})

// updating a document
document.addEventListener('DOMContentLoaded', (event) => {
  document.body.addEventListener('submit', (e) => {
    if (e.target.matches('.update')){
      e.preventDefault()
      let docRef = doc(db, 'users', updateForm.id.value)
  
      updateDoc(docRef, {
        name: 'updated name',
        id: 'updated ID'
      })
      .then(() => {
        updateForm.reset()
      })
    }
  })
})

// login form
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.login');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('loggedInUserId', userCredential.user.uid);
        
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          redirectUser('dashboard.html');
        } else {
          throw new Error('User data not found');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Invalid email or password');
      }
    });
  }
});

// Logout handler
document.body.addEventListener('click', (e) => {
  if (e.target.matches('.logout')) {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        localStorage.removeItem('loggedInUserId');
        window.location.href = 'index.html';
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  }
});

// Function to render the login/logout button based on auth state
function renderAuthButton(user) {
  const authButtonContainer = document.getElementById('auth-button-container');
  if (!authButtonContainer) return;

  if (user) {
    authButtonContainer.innerHTML = `
    <div class="flex-1">
      <button class="p-2 rounded-full text-gray-500 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
      <a  href="dashboard.html" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Welcome, ${user.email}</a>
      <button class="logout px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
        Logout
      </button>
      </div>`;
  } else {
    authButtonContainer.innerHTML = `
      <a href="loginPage.html" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
        Login
      </a>`;
  }
}   

// Redirect Users Immediately After Sign-Up Based on Role
function redirectUser(role) {
  const pages = {
    student: "studentDashboard.html",
    organizer: "organizerDashboard.html",
    admin: "adminDashboard.html"
  };
  window.location.href = pages[role] || "dashboard.html";
}

/*Dashboard Section */
// Toggle Dashboard Sections Based on Role
function loadDashboard(role) {
  const dashboards = {
    student: document.getElementById("dashboard-student"),
    organizer: document.getElementById("dashboard-organizer"),
    admin: document.getElementById("dashboard-admin"),
  };

  Object.values(dashboards).forEach(section => section?.classList.add("hidden"));

  if (dashboards[role]) {
    dashboards[role].classList.remove("hidden");
  } else {
    console.warn("No dashboard found for role:", role);
  }
}

 // Function to display user profile
 function displayUserProfile(userData) {
  if (!userData) return;

  const name = document.getElementById("name");
  if (name) name.textContent = userData.name;

  const stuID = document.getElementById("stuID");
  if (stuID) stuID.textContent = userData.stuID;

  const email = document.getElementById("email");
  if (email) email.textContent = userData.email;

  const role = document.getElementById("role");
  if (role) role.textContent = userData.role;

  const dashboard = document.getElementById(`dashboard-${userData.role}`);
  if (dashboard) dashboard.classList.remove("hidden");
}

// --- Load Featured Events ---
async function loadFeaturedEvents() {
  query (collection(db, "events"), where("status", "==", "approved"))
  const container = document.querySelector("#featured-events .grid");
  if (!container) return;

  try {
    const q = query(eventsCollection, where("featured", "==", true));
    const snapshot = await getDocs(q);

    container.innerHTML = "";

    snapshot.forEach((doc) => {
      const event = doc.data();
      const card = createEventCard(event);
      container.appendChild(card);
    });

    initializeEventAnimations();
  } catch (error) {
    console.error("Error loading featured events:", error);
    container.innerHTML = `
      <div class="col-span-full text-center text-red-600">
        Error loading events. Please try again later.
      </div>`;
  }
}

async function loadUserEvents(uid) {
  const container = document.querySelector("#user-events");
  if (!container) return;

  try {
    const q = query(eventsCollection, where("userId", "==", uid));
    const snapshot = await getDocs(q);

    container.innerHTML = snapshot.empty 
      ? `<p class="text-gray-500">No events found.</p>`
      : "";

    snapshot.forEach((doc) => {
      const event = doc.data();
      const card = createEventCard(event);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading user events:", error);
    container.innerHTML = `
      <p class="text-red-500">Error loading events. Please try again later.</p>`;
  }
}

// Helper functions
function createEventCard(event) {
  const card = document.createElement("div");
  card.className = "bg-white rounded-lg shadow p-4 mb-4";
  
  card.innerHTML = `
    <h3 class="text-xl font-semibold">${event.title}</h3>
    <p class="text-gray-600 mt-1">${event.description}</p>
    ${event.date ? `<p class="text-sm text-gray-400 mt-2">Date: ${event.date}</p>` : ""}
  `;
  
  return card;
}

async function loadOrganizerDashboard(uid) {
  const now = new Date();
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('organizerId', '==', uid));
  const querySnapshot = await getDocs(q);

  const upcomingContainer = document.getElementById('upcoming-events');
  const pastContainer = document.getElementById('past-events');

  if (upcomingContainer) upcomingContainer.innerHTML = '';
  if (pastContainer) pastContainer.innerHTML = '';

  querySnapshot.forEach(doc => {
    const event = doc.data();
    const eventDate = new Date(event.date);

    if (eventDate >= now) {
      // Upcoming Event
      if (upcomingContainer) {
        const card = `
          <div class="bg-white p-4 shadow rounded relative" data-event-id="${doc.id}">
            <h4 class="text-lg font-semibold">${event.title || event.name}</h4>
            <p class="text-sm text-gray-600">${eventDate.toDateString()} - ${event.time || event.startTime}</p>
            <p class="text-sm mt-2">${event.description || 'No description available.'}</p>
            
            <div class="absolute top-4 right-4 space-x-2">
              <button onclick="editEvent('${doc.id}')" class="text-sm text-blue-600 hover:underline">Edit</button>
              <button onclick="deleteEvent('${doc.id}')" class="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>`;
        upcomingContainer.insertAdjacentHTML('beforeend', card);
      }
    } else {
      // Past Event + Reviews
      if (pastContainer) {
        const reviews = event.reviews || [];
        const reviewHTML = reviews.length
          ? reviews.map(r => `<p class="text-sm text-gray-600">⭐ ${r.rating}/5 — "${r.comment}"</p>`).join('')
          : '<p class="text-sm text-gray-400">No reviews yet.</p>';

        const card = `
          <div class="bg-white p-4 shadow rounded">
            <h4 class="text-lg font-semibold">${event.title || event.name}</h4>
            <p class="text-sm text-gray-600">${eventDate.toDateString()}</p>
            <div class="mt-2">${reviewHTML}</div>
          </div>`;
        pastContainer.insertAdjacentHTML('beforeend', card);
      }
    }
  });
}

//Organizer Event Request
document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.getElementById("inline-Submit");
  if (submitButton) {
    submitButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create an event.");
        return;
      }
      try {
        const eventData = {
          title: document.getElementById("inline-event-name").value,
          description: document.getElementById("inline-event-description").value,
          location: document.getElementById("inline-event-location").value,
          date: document.getElementById("inline-event-date-start").value,
          startTime: document.getElementById("inline-event-time-start").value,
          endDate: document.getElementById("inline-event-date-end").value,
          endTime: document.getElementById("inline-event-time-end").value,
          publicity: document.querySelector('input[name="event-publicity"]:checked')?.value || "Public",
          requiresRegistration: document.querySelectorAll('input[type="checkbox"]')[0]?.checked || false,
          requiresStudentId: document.querySelectorAll('input[type="checkbox"]')[1]?.checked || false,
          organizerId: user.uid,
          createdAt: serverTimestamp(),
          status: "pending"
        };

        const docRef = await addDoc(collection(db, "events"), eventData);
        console.log("Event created with ID:", docRef.id);
        alert("Event request submitted successfully!");
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("Error creating event:", error);
        alert("Error creating event. Please try again.");
      }
    });
  }
});

const cancelButton = document.getElementById("inline-Cancel");
if (cancelButton) {
  cancelButton.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}

function editEvent(eventId) {
  window.location.href = `eventCreatePage.html?eventId=${eventId}`;
}

async function deleteEvent(eventId) {
  if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
    try {
      await deleteDoc(doc(db, "events", eventId));
      alert("Event deleted successfully.");
      location.reload();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Try again.");
    }
  }
}

async function loadPendingEvents() {
  const eventsRef = collection(db, "events");
  const q = query(eventsRef, where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);

  const tableBody = document.querySelector("#pending-events-table-body");
  if (!tableBody) return;
  
  tableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const row = `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="h-10 w-10 flex-shrink-0">
              <img class="h-10 w-10 rounded-full" src="${data.image || 'https://via.placeholder.com/40'}" alt="">
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">${data.title || data.name}</div>
              <div class="text-sm text-gray-500">${data.category || ''}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${data.organizer?.name || ''}</div>
          <div class="text-sm text-gray-500">${data.organizer?.organization || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${new Date(data.date).toLocaleDateString()}</div>
          <div class="text-sm text-gray-500">${data.startTime || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending Review
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div class="flex space-x-2">
            <button class="text-green-600 hover:text-green-900" onclick="approveEvent('${doc.id}')">Approve</button>
            <button class="text-red-600 hover:text-red-900" onclick="denyEvent('${doc.id}')">Deny</button>
            <button class="text-blue-600 hover:text-blue-900" onclick="window.location.href='eventDetails.html?id=${doc.id}'">View</button>
          </div>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

async function approveEvent(eventId) {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      status: "approved"
    });
    loadPendingEvents();
  } catch (error) {
    console.error("Error approving event:", error);
    alert("Failed to approve event. Please try again.");
  }
}

async function denyEvent(eventId) {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      status: "denied"
    });
    loadPendingEvents();
  } catch (error) {
    console.error("Error denying event:", error);
    alert("Failed to deny event. Please try again.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const isDashboard = window.location.pathname.includes('dashboard');

  onAuthStateChanged(auth, async (user) => {
    renderAuthButton(user);

    if (isDashboard && !user) {
      window.location.href = 'loginPage.html';
      return;
    }

    if (isDashboard && user) {
      const uid = user.uid;

      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role;

          loadDashboard(role);
          displayUserProfile(userData);
          loadUserEvents(uid);
          loadOrganizerDashboard(uid);
          
          if (role === 'admin') {
            loadPendingEvents();
          }
        } else {
          console.error("No user data found in Firestore.");
          signOut(auth);
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  if (!eventId) return; // Prevent unnecessary execution

  let currentUser = null;
  let currentEvent = null;

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        currentUser = { ...user, ...userDoc.data() };
      }
    }
    loadEventDetails();
  });

  async function loadEventDetails() {
    try {
      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (!eventDoc.exists()) return showError("Event not found");

      currentEvent = { id: eventDoc.id, ...eventDoc.data() };

      if (!canViewEvent(currentEvent, currentUser)) {
        return showError("You don't have permission to view this event");
      }

      displayEvent(currentEvent);
    } catch (error) {
      console.error("Error loading event:", error);
      showError("Error loading event details");
    }
  }

  function canViewEvent(event, user) {
    if (!event) return false;
    if (event.status === "approved") return true;
    if (!user) return false;

    return user.role === "admin" || (user.role === "organizer" && event.organizerId === user.uid);
  }

  function displayEvent(event) {
    document.getElementById("loading-state")?.classList.add("hidden");
    document.getElementById("event-content")?.classList.remove("hidden");

    document.getElementById("event-title").textContent = event.title;
    document.getElementById("event-description").textContent = event.description;
    document.getElementById("event-date").textContent = new Date(event.date).toLocaleDateString();
    document.getElementById("event-location").textContent = event.location;
    document.getElementById("event-start-time").textContent = `Starts: ${event.startTime}`;
    document.getElementById("event-end-time").textContent = `Ends: ${event.endTime}`;
    document.getElementById("event-type").textContent = `Type: ${event.publicity}`;
    document.getElementById("registration-required").textContent = 
      `Registration: ${event.requiresRegistration ? "Required" : "Not Required"}`;
    document.getElementById("student-id-required").textContent = 
      `Student ID: ${event.requiresStudentId ? "Required" : "Not Required"}`;

    const statusBadge = document.getElementById("status-badge");
    if (statusBadge) {
      const statusClasses = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        denied: "bg-red-100 text-red-800"
      };
      statusBadge.innerHTML = `
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[event.status]}">
          ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </span>
      `;
    }

    if (currentUser?.role === "admin") {
      document.getElementById("admin-actions")?.classList.remove("hidden");
    }

    if (currentUser?.role === "organizer" && event.organizerId === currentUser.uid) {
      document.getElementById("organizer-actions")?.classList.remove("hidden");
    }
  }

  function showError(message) {
    document.getElementById("loading-state")?.classList.add("hidden");
    const errorState = document.getElementById("error-state");
    if (errorState) {
      errorState.classList.remove("hidden");
      errorState.querySelector("p").textContent = message;
    }
  }

  // Actions exposed to window for button onclick usage
  window.approveEvent = async function () {
    try {
      await updateDoc(doc(db, "events", currentEvent.id), { status: "approved" });
      location.reload();
    } catch (error) {
      console.error("Error approving event:", error);
      alert("Failed to approve event");
    }
  };

  window.denyEvent = async function () {
    try {
      await updateDoc(doc(db, "events", currentEvent.id), { status: "denied" });
      location.reload();
    } catch (error) {
      console.error("Error denying event:", error);
      alert("Failed to deny event");
    }
  };

  window.editEvent = function () {
    window.location.href = `eventCreatePage.html?eventId=${currentEvent.id}`;
  };

  window.deleteEvent = async function () {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "events", currentEvent.id));
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event");
      }
    }
  };
});
document.addEventListener("DOMContentLoaded", () => {
  // Check if calendar container exists on this page
  const calendarContainer = document.getElementById("calendar-container");
  if (!calendarContainer) return;

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  const monthYearLabel = document.getElementById("month-label");
  const calendarGrid = document.getElementById("calendar-grid");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  if (!monthYearLabel || !calendarGrid || !prevMonthBtn || !nextMonthBtn) return;

  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
  });

  async function renderCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarGrid.innerHTML = "";
    monthYearLabel.textContent = `${new Date(year, month).toLocaleString("default", { month: "long" })} ${year}`;

    const calendarCells = [];

    for (let i = 0; i < firstDay; i++) {
      calendarCells.push(`<div class="p-2 h-24 border rounded bg-gray-50"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dateStr = cellDate.toISOString().split("T")[0];

      calendarCells.push(`
        <div class="p-2 h-24 border rounded bg-white overflow-auto" id="day-${dateStr}">
          <div class="font-bold">${day}</div>
          <div class="mt-1 space-y-1 text-xs text-left" id="events-${dateStr}"></div>
        </div>
      `);
    }

    calendarGrid.innerHTML = calendarCells.join("");

    await loadEventsForMonth(month, year);
  }

  async function loadEventsForMonth(month, year) {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    const q = query(
      collection(db, "events"),
      where("date", ">=", startOfMonth.toISOString()),
      where("date", "<=", endOfMonth.toISOString())
    );

    try {
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const event = doc.data();
        const eventDate = new Date(event.date).toISOString().split("T")[0];
        const target = document.getElementById(`events-${eventDate}`);

        if (target) {
          target.innerHTML += `
            <a class="block bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate hover:underline" 
               href="eventDetails.html?id=${doc.id}" 
               title="${event.title}">
               ${event.title}
            </a>
          `;
        }
      });
    } catch (error) {
      console.error("Error fetching events for calendar:", error);
    }
  }

  // Initial render
  renderCalendar(currentMonth, currentYear);
});