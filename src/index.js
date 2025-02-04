// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCGtWIzrefSz12n86tWzbHnetUnHT3QFo8",
  authDomain: "eventnest-52826.firebaseapp.com",
  projectId: "eventnest-52826",
  storageBucket: "eventnest-52826.firebasestorage.app",
  messagingSenderId: "621756390258",
  appId: "1:621756390258:web:7a71692f79c503d2de1beb",
  measurementId: "G-8FXCZ7KZV3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);