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

// Sign-Up Form Submission
document.addEventListener('submit', async (e) => {
  if (e.target.matches('.signup-form')) {
    e.preventDefault();

    const form = e.target;
    const role = form.getAttribute("data-role");
    const name = form.querySelector("[id^='name']").value;
    const email = form.querySelector("[id^='email']").value;
    const password = form.querySelector("[id^='password']").value;
    const stuId = role === "student" ? document.getElementById("stuID")?.value : null;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // Store user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name, email, role, stuId, createdAt: new Date()
      });

      console.log("User Created:", user);
      localStorage.setItem('loggedInUserId', user.uid);
      redirectUser(role);
    } catch (error) {
      console.error("Error creating user:", error);
      alert(error.message);
    }
  }
});

// Redirect Users Based on Role
function redirectUser(role) {
  const pages = {
    student: "studentDashboard.html",
    organizer: "organizerDashboard.html",
    admin: "adminDashboard.html"
  };
  window.location.href = pages[role] || "dashboard.html";
}

// Login Functionality
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("submit", async (e) => {
    if (e.target.matches('.login')) {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;

      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          console.log('user logged in: ', cred.user); 
          const user = cred.user;
          localStorage.setItem('loggedInUserId', user.uid);
          redirectUser(userDoc.data().role);
          window.location.href = 'dashboard.html'; // Redirect to dashboard after login
        } else {
          console.error("User data not found.");
        }
      } catch (error) {
        console.error(error.message);
        alert("Invalid login credentials");
      }
    }
  });

  // Logout Functionality
  document.body.addEventListener("click", async (e) => {
    if (e.target.matches('.logout')) {
      try {
        await signOut(auth);
        console.log('User signed out');
      } catch (error) {
        console.error(error.message);
      }
    }
  });
});

// Authentication State Change Listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    console.log("User UID:", uid);

    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      loadDashboard(userDoc.data().role);
    } else {
      console.log("User data not found.");
    }
  } else {
    window.location.href = "login.html"; // Redirect to login if not authenticated
  }
});

// Load Dashboard Based on User Role
function loadDashboard(role) {
  document.getElementById("dashboard-student")?.classList.add("hidden");
  document.getElementById("dashboard-organizer")?.classList.add("hidden");
  document.getElementById("dashboard-admin")?.classList.add("hidden");

  if (role === "student") {
    document.getElementById("dashboard-student")?.classList.remove("hidden");
  } else if (role === "organizer") {
    document.getElementById("dashboard-organizer")?.classList.remove("hidden");
  } else if (role === "admin") {
    document.getElementById("dashboard-admin")?.classList.remove("hidden");
  }
}
