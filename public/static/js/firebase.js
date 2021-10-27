// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvitJwdzZJb5UTOV1xa73pwWBw7ws9yPE",
  authDomain: "maze-task.firebaseapp.com",
  projectId: "maze-task",
  storageBucket: "maze-task.appspot.com",
  messagingSenderId: "833236089000",
  appId: "1:833236089000:web:ae727d00645c4edbfb6a9d"
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

// Firebase table name
var task_name = 'live_pilot';


