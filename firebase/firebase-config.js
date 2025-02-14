// firebase/firebase-config.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    RecaptchaVerifier, 
    signInWithPhoneNumber 
} from "firebase/auth";

// Firebase configuration (Ensure the correct values are used)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",  // Replace with your actual API key
    authDomain: "service-2fded.firebaseapp.com",
    databaseURL: "https://service-2fded-default-rtdb.firebaseio.com",
    projectId: "service-2fded",
    storageBucket: "service-2fded.appspot.com",
    messagingSenderId: "620330308922",
    appId: "1:620330308922:web:5b122652d4e8c59be82c03",
    measurementId: "G-4V0GGQJQY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { 
    db, auth, provider, ref, set, onValue, signInWithPopup, 
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, 
    RecaptchaVerifier, signInWithPhoneNumber 
};
