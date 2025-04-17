// Import Firebase SDKs
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc, query, where,
  updateDoc, getDoc, setDoc, getDocs
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

/* Menu Section */
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

/* Sign Up and Login Section */
// Tab functionality
const tabButtons = document.querySelectorAll(".tab-btn");
const forms = document.querySelectorAll(".signup-form");

tabButtons.forEach(button => {
  button.addEventListener("click", function() {
    const target = this.getAttribute("data-target");

    // Hide all forms
    forms.forEach(form => form.classList.add("hidden"));

    // Remove active state from all tabs
    tabButtons.forEach(btn => {
      btn.classList.remove("text-green-600", "border-green-500", "font-bold");
      btn.classList.add("text-gray-600", "border-transparent", "font-medium");
    });

    // Show selected form
    document.getElementById(`${target}-form`).classList.remove("hidden");
     // Highlight the selected tab
    this.classList.add("text-green-600", "border-green-500", "font-bold");
    this.classList.remove("text-gray-600", "border-transparent", "font-medium");
  });
});   

// Set default active tab
document.addEventListener("DOMContentLoaded", () => {
  tabButtons[0]?.click(); // Optional chaining prevents error if tabButtons[0] is undefined
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
      <span class="text-sm text-gray-200 mr-4">Welcome, ${user.email}</span>
      <button class="logout px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
        Logout
      </button>`;
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
});

async function loadOrganizerDashboard(uid) {
  const now = new Date();
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('organizerId', '==', uid));
  const querySnapshot = await getDocs(q);

  const upcomingContainer = document.getElementById('upcoming-events');
  const pastContainer = document.getElementById('past-events');

  querySnapshot.forEach(doc => {
    const event = doc.data();
    const eventDate = new Date(event.date);

    if (eventDate >= now) {
      // Upcoming Event
        const card = `
        <div class="bg-white p-4 shadow rounded relative" data-event-id="${doc.id}">
          <h4 class="text-lg font-semibold">${event.title}</h4>
          <p class="text-sm text-gray-600">${eventDate.toDateString()} - ${event.time}</p>
          <p class="text-sm mt-2">${event.description || 'No description available.'}</p>
          
          <div class="absolute top-4 right-4 space-x-2">
            <button onclick="editEvent('${doc.id}')" class="text-sm text-blue-600 hover:underline">Edit</button>
            <button onclick="deleteEvent('${doc.id}')" class="text-sm text-red-600 hover:underline">Delete</button>
          </div>
        </div>`;
      upcomingContainer.innerHTML += card;
      
    } else {
      // Past Event + Reviews
      const reviews = event.reviews || [];
      const reviewHTML = reviews.length
        ? reviews.map(r => `<p class="text-sm text-gray-600">⭐ ${r.rating}/5 — "${r.comment}"</p>`).join('')
        : '<p class="text-sm text-gray-400">No reviews yet.</p>';

      const card = `
        <div class="bg-white p-4 shadow rounded">
          <h4 class="text-lg font-semibold">${event.title}</h4>
          <p class="text-sm text-gray-600">${eventDate.toDateString()}</p>
          <div class="mt-2">${reviewHTML}</div>
        </div>`;
      pastContainer.innerHTML += card;
    }
  });
}

function editEvent(eventId) {
  // Redirect to the event creation page with eventId as a query parameter
  window.location.href = `eventCreatePage.html?eventId=${eventId}`;
}

async function deleteEvent(eventId) {
  if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
    try {
      await deleteDoc(doc(db, "events", eventId));
      alert("Event deleted successfully.");
      // Optionally reload the dashboard
      location.reload();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Try again.");
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const isDashboard = window.location.pathname.includes('dashboard');

  onAuthStateChanged(auth, async (user) => {
    renderAuthButton(user); // Always show login/logout button correctly

    // Redirect if on dashboard and not logged in
    if (isDashboard && !user) {
      window.location.href = 'loginPage.html';
      return;
    }

    // If logged in and on dashboard, load user data
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
        } else {
          console.error("No user data found in Firestore.");
          // Optional: Redirect or show an error
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    }
  });
});

