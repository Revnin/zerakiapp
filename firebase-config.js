// firebase-config.js

// Firebase configuration for Kitui School Zeraki System
const firebaseConfig = {
  apiKey: "AIzaSyDDGF2a5rrRWdHB-MaH4s3o1QAN4E6SZmk",
  authDomain: "zeraki-clone.firebaseapp.com",
  projectId: "zeraki-clone",
  storageBucket: "zeraki-clone.appspot.com",
  messagingSenderId: "74324840224",
  appId: "1:74324840224:web:0f5d79d7b21a5474dbd145"
};

// Initialize Firebase using the compat SDK
firebase.initializeApp(firebaseConfig);

// Global Firestore & Auth references
const db = firebase.firestore();
const auth = firebase.auth();
