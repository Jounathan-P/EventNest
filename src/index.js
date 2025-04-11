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
    document.getElementById(target).classList.remove("hidden");

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
  document.body.addEventListener('submit', (e) => {
    if (e.target.matches('.add')){
      e.preventDefault()

      const forms = e.target;
      const role = forms.getAttribute("data-role");

      const name = document.getElementById('name').value;
      const stuIDInput = document.getElementById('stuID').value;
      const stuID = role === "student" && stuIDInput ? stuIDInput.value : null;

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      createUserWithEmailAndPassword(auth, email, password)
      .then(cred => {
        const user = cred.user;
        const userData = {
          email: email,
          name: name,
          role: role,
          stuID: stuID || null,
          createdAt: new Date()
        };
        console.log('user created with role: ', role, '/ and credentials: ', cred.user)
        localStorage.setItem('loggedInUserId', user.uid);
        const docRef = doc(db, 'users', user.uid);
        setDoc(docRef, userData)
        .then(() => {
          redirectUser(role);
        })
        .catch(err => {
          console.log(err.message)
        });
      })
      .catch(err => {
        console.log(err.message)
        const errMsg = error.code;
        if(errMsg == 'auth/email-already-in-use'){
          alert('Email address already exists!')
        } else {
          alert('Unable to create user')
        }
      })
    }
  })
})

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

// Sign-Up Form Submission
document.addEventListener('DOMContentLoaded', (event) => {
  document.body.addEventListener('submit', (e) => {
    if (e.target.matches('.signup')){
    e.preventDefault();

    const email = e.target.email.value
    const password = e.target.password.value

    createUserWithEmailAndPassword(auth, email, password)
    .then(cred => {
      console.log('user created:', cred.user)
      e.target.reset()
    })
    .catch(err => {
      console.log(err.message)
    })
    }
  })

  // log in and out
document.body.addEventListener('click', (e) => {
  if (e.target.matches('.logout')) {
    e.preventDefault()
    signOut(auth)
    .then(() => {
      console.log('You have been signed out');
    })
    .catch((err) => {
      console.log(err.message);
    })
  }
})

const loginForm = document.querySelector('.login')
document.body.addEventListener('submit', (e) => { 
  if (e.target.matches('.login')) { 
    e.preventDefault(); 
    const email = e.target.email.value; 
    const password = e.target.password.value; 
    signInWithEmailAndPassword(auth, email, password) 
    .then((cred) => { 
      console.log('user logged in: ', cred.user); 
      const user = cred.user;
      localStorage.setItem('loggedInUserId', user.uid);
      window.location.href = 'dashboard.html'; // Redirect to dashboard after login
    }) 
    .catch((err) => { 
      console.log(err.message); 
    })
  } 
})
})

// Function to render the login/logout button based on auth state
function renderAuthButton(user) {
  const authButtonContainer = document.getElementById('auth-button-container')
  if(!authButtonContainer){
    console.warn("auth container not found on this page")
    return
  }
  if (user) {
    // If the user is logged in, show a Logout button
    authButtonContainer.innerHTML = 
      `<span class="me-3 text-light">Hello, ${user.email}</span>
      <button class="btn btn-danger" id="logout">Logout</button>`;
    // Add event listener for logout
    document.getElementById('logout').addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.reload(); // Reload the page after logout
        window.location.href = 'index.html'; // Redirect to homepage after logout
      }).catch((error) => {
        console.error('Logout Error:', error);
      })
    })
  } else {
    // If the user is not logged in, show a Login button
    authButtonContainer.innerHTML = `<a href="loginPage.html" class="btn btn-primary">Login</a>`;
  }
}    

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    renderAuthButton(user);
  });
});

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
// Show Relevant Dashboard After Login Based on Role
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    console.log("User UID:", uid);

    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        loadDashboard(role);
      } else {
        console.error("No user data found in Firestore.");
        // Optionally redirect or show error message
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error.message);
    }

  } else {
    window.location.href = "loginPage.html"; // Not logged in
  }
});

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

// Wait for authentication state change
document.addEventListener('DOMContentLoaded', () => {
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      displayUserProfile(userData);
      loadUserEvents(uid);
    } else {
      console.log("User data not found.");
    }
  } else {
    window.location.href = "loginPage.html"; // Redirect if not logged in
  }
});
});

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

  container.innerHTML = ""; // Clear any placeholder content

  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("featured", "==", true));
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      const event = doc.data();

      const card = document.createElement("div");
      card.className =
        "featured-event opacity-0 transform translate-y-10 transition duration-700 ease-in-out bg-white p-4 rounded-lg shadow";

      card.innerHTML = `
        <h3 class="text-xl font-semibold">${event.title}</h3>
        <p class="text-gray-600 mt-2">${event.description}</p>
      `;

      container.appendChild(card);
    });

    // Scroll-reveal animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0", "translate-y-10");
          entry.target.classList.add("opacity-100", "translate-y-0");
        } else {
          entry.target.classList.remove("opacity-100", "translate-y-0");
          entry.target.classList.add("opacity-0", "translate-y-10");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".featured-event").forEach((el) => {
      observer.observe(el);
    });

  } catch (error) {
    console.error("Error loading featured events:", error);
  }
}

// --- DOM Ready ---
document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedEvents();
});

async function loadUserEvents(uid) {
  const container = document.querySelector("#user-events");
  if (!container) return;

  container.innerHTML = ""; // Clear previous content

  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("userId", "==", uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `<p class="text-gray-500">No events found.</p>`;
      return;
    }

    snapshot.forEach((doc) => {
      const event = doc.data();

      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow p-4 mb-4";

      card.innerHTML = `
        <h3 class="text-xl font-semibold">${event.title}</h3>
        <p class="text-gray-600 mt-1">${event.description}</p>
        ${event.date ? `<p class="text-sm text-gray-400 mt-2">Date: ${event.date}</p>` : ""}
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading user events:", error);
    container.innerHTML = `<p class="text-red-500">Error loading events. Please try again later.</p>`;
  }
}