// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPjWo_R_5z5HW-arUVtmvN5LhCVHxIFmw",
  authDomain: "austimstudy.firebaseapp.com",
  databaseURL: "https://austimstudy-default-rtdb.firebaseio.com",
  projectId: "austimstudy",
  storageBucket: "austimstudy.appspot.com",
  messagingSenderId: "361964294732",
  appId: "1:361964294732:web:914fe1da9d9b80a7f91ae9"
};

// Initialize Firebase
const app = firebase. initializeApp(firebaseConfig);

// error handeling 
firebase.firestore().enablePersistence()
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
      }
  });

// Sign in
firebase.auth().signInAnonymously();

// User ID
var uid;

// setup the database
var db = firebase.firestore();

// When signed in, get the user ID
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    uid = user.uid;
  }
});

// This Random subject ID will need to be replaced with a prolific ID
var subjID = '7' + Math.random().toString().substring(3,8);



