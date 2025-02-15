// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getDatabase, ref, set, onValue, connectDatabaseEmulator } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';

const firebaseConfig = {
  apiKey: "AIzaSyAlQ6OP0if-fXb54LKVzO8Ynn_bRzrwtfU",
  authDomain: "service-2fded.firebaseapp.com",
  databaseURL: "https://service-2fded-default-rtdb.firebaseio.com",
  projectId: "service-2fded",
  storageBucket: "service-2fded.firebasestorage.app",
  messagingSenderId: "620330308922",
  appId: "1:620330308922:web:5b122652d4e8c59be82c03",
  measurementId: "G-4V0GGQJQY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Connect to Emulators in development
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectDatabaseEmulator(database, "localhost", 9000);
}

export { 
  app, 
  analytics, 
  database, 
  auth, 
  provider, 
  ref, 
  set, 
  onValue 
};