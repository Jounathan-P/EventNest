// Import Firebase SDKs
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc, query, where,
  updateDoc, getDoc, setDoc
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

// Realtime Snapshot Listener
onSnapshot(usersCollection, (snapshot) => {
  const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  console.log(users);
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
// Tab Switching for Sign-Up
const tabButtons = document.querySelectorAll(".tab-btn");
const forms = document.querySelectorAll(".signup-form");

tabButtons.forEach(button => {
  button.addEventListener("click", function () {
    const target = this.getAttribute("data-target");

    // Hide all forms
    forms.forEach(form => form.classList.add("hidden"));

    // Update tab UI state
    tabButtons.forEach(btn => btn.classList.remove("text-green-600", "border-green-500", "font-bold"));
    this.classList.add("text-green-600", "border-green-500", "font-bold");

    // Show selected form
    document.getElementById(target).classList.remove("hidden");
  });
});

// Set default active tab
if (tabButtons.length) tabButtons[0].click();

// adding user docs
document.addEventListener('DOMContentLoaded', (event) => {
  document.body.addEventListener('submit', (e) => {
    if (e.target.matches('.add')){
      e.preventDefault()
      const name = document.getElementById('name').value;
      const stuIDInput = document.getElementById('stuID').value;
      const role = form.getAttribute("data-role");
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const stuID = role === "student" && stuIDInput ? stuIDInput.value : null;

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

// Function to display user profile
function displayUserProfile(userData) {
  document.getElementById("user-name").textContent = userData.name;
  document.getElementById("user-email").textContent = userData.email;
  document.getElementById("user-role").textContent = userData.role;
  document.getElementById(`dashboard-${userData.role}`).classList.remove("hidden");
}

// Function to load favorited and upcoming/past events
async function loadUserEvents(uid) {
  const favoritesRef = collection(db, "favorites");
  const favoritesQuery = query(favoritesRef, where("userId", "==", uid));
  const favoriteDocs = await getDoc(favoritesQuery);

  const upcomingEventsRef = collection(db, "events");
  const upcomingQuery = query(upcomingEventsRef, where("attendees", "array-contains", uid));
  const eventDocs = await getDoc(upcomingQuery);

  const currentDate = new Date();

  // Populate favorite events
  const favoritesContainer = document.getElementById("favorited-events");
  favoritesContainer.innerHTML = "";
  favoriteDocs.forEach(doc => {
    const event = doc.data();
    favoritesContainer.innerHTML += `<p>${event.title}</p>`;
  });

  // Populate upcoming and past events
  const upcomingContainer = document.getElementById("upcoming-events");
  const pastContainer = document.getElementById("past-events");
  upcomingContainer.innerHTML = "";
  pastContainer.innerHTML = "";

  eventDocs.forEach(doc => {
    const event = doc.data();
    const eventDate = new Date(event.date);
    const eventElement = `<p>${event.title} - ${event.date}</p>`;
    
    if (eventDate >= currentDate) {
      upcomingContainer.innerHTML += eventElement;
    } else {
      pastContainer.innerHTML += eventElement;
    }
  });
}
