// src/Services/Firebase.tsx
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB5tcbN2pVWTok5_-JkfgUCEprn4p5x0EM",
  authDomain: "auth-test-b09a5.firebaseapp.com",
  projectId: "auth-test-b09a5",
  storageBucket: "auth-test-b09a5.appspot.com",
  messagingSenderId: "288111800415",
  appId: "1:288111800415:web:be9005a9682154ba796bea",
  measurementId: "G-QSHSWLDT5Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
// Set persistence to local to survive page refreshes
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase persistence set to local');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });
const db = getFirestore(app);

export { auth, db, analytics };