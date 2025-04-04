// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB5tcbN2pVWTok5_-JkfgUCEprn4p5x0EM",
  authDomain: "auth-test-b09a5.firebaseapp.com",
  projectId: "auth-test-b09a5",
  storageBucket: "auth-test-b09a5.firebasestorage.app",
  messagingSenderId: "288111800415",
  appId: "1:288111800415:web:be9005a9682154ba796bea",
  measurementId: "G-QSHSWLDT5Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, analytics };