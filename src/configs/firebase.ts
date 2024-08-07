// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDabydJdmwsByJcDN6-lABSQqsklMbKOHc",
  authDomain: "gymmetrics-bbf71.firebaseapp.com",
  projectId: "gymmetrics-bbf71",
  storageBucket: "gymmetrics-bbf71.appspot.com",
  messagingSenderId: "8489328835",
  appId: "1:8489328835:web:d5dda93b1539558a6e4276",
  measurementId: "G-VBG3SZT7GB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, analytics, auth, db };
