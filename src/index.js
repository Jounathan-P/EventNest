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

// adding user docs
document.addEventListener('DOMContentLoaded', (event) => {
  document.body.addEventListener('submit', (e) => {
    if (e.target.matches('.add')){
      e.preventDefault()
      const name = document.getElementById('name').value;
      const stuID = document.getElementById('stuID').value;
      const role = document.getElementById('role').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      createUserWithEmailAndPassword(auth, email, password)
      .then(cred => {
        const user = cred.user;
        const userData = {
          email: email,
          name: name
        };
        console.log('user created:', cred.user)
        localStorage.setItem('loggedInUserId', user.uid);
        const docRef = doc(db, 'users', user.uid);
        setDoc(docRef, userData)
        .then(() => {
          window.location.href = 'eventBrowser.html';
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

//deleting docs
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
        name: 'updated name'
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

  //log in and out
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
      window.location.href = 'eventBrowser.html'; // Redirect to browser after login
    }) 
    .catch((err) => { 
      console.log(err.message); 
    })
  } 
})
})

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
