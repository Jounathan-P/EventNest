// Import the functions you need from the SDKs
import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  updateDoc, getDoc, setDoc
} from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword, 
  signOut, signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCGtWIzrefSz12n86tWzbHnetUnHT3QFo8",
  authDomain: "eventnest-52826.firebaseapp.com",
  projectId: "eventnest-52826",
  storageBucket: "eventnest-52826.firebasestorage.app",
  messagingSenderId: "621756390258",
  appId: "1:621756390258:web:7a71692f79c503d2de1beb",
  measurementId: "G-8FXCZ7KZV3"
};

// init firebase
initializeApp(firebaseConfig)

// init services
const db = getFirestore()
const auth = getAuth()

// collection ref
const colRef = collection(db, 'users')

// queries
const q = query(colRef, where("name", "==", "John Doe"), orderBy('createdAt'))

// realtime collection data
onSnapshot(colRef, (snapshot) => {
  let users = []
  snapshot.docs.forEach(doc => {
    users.push({ ...doc.data(), id: doc.id })
  })
  console.log(users)
})

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && menuClose && mobileMenu) {
    // Open menu
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.remove("hidden");
      mobileMenu.classList.add("flex"); // Ensures visibility
    });

    // Close menu
    menuClose.addEventListener("click", function () {
      mobileMenu.classList.add("hidden");
      mobileMenu.classList.remove("flex");
    });

    // Close menu when clicking outside of the white menu box
    mobileMenu.addEventListener("click", function (event) {
      if (event.target === mobileMenu) {
        mobileMenu.classList.add("hidden");
        mobileMenu.classList.remove("flex");
      }
    });
  } else {
    console.error("One or more menu elements not found. Check your HTML IDs.");
  }
});

// adding user docs
document.addEventListener('DOMContentLoaded', (event) => {
    document.body.addEventListener('submit', (e) => {
      if (e.target.matches('.add')){
        e.preventDefault()
          const name = document.getElementById('name').value;
          const stuId = document.getElementById('stuID').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
    
          createUserWithEmailAndPassword(auth, email, password)
          .then(cred => {
            const user = cred.user;
            const userData = {
              email: email,
              name: name,
              stuId: stuId
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
// Handle sign-up for all forms
document.querySelectorAll(".signup-form").forEach(form => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = form.querySelector("input[type='email']").value;
    const password = form.querySelector("input[type='password']").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert(`Sign-up successful! Welcome, ${userCredential.user.email}`);
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
});
// signing users up
document.addEventListener('DOMContentLoaded', (event) => {
    document.body.addEventListener('submit', (e) => {
      if (e.target.matches('.signup')){
      e.preventDefault()
  
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
  })
  
document.addEventListener('DOMContentLoaded', (event) => {
    document.body.addEventListener('submit', (e) => {
        if (e.target.matches('.signup')){
            e.preventDefault()

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
            window.location.href = 'homepage.html'; // Redirect to homepage after login
            }) 
            .catch((err) => { 
            console.log(err.message); 
            })
        } 
    })
})
