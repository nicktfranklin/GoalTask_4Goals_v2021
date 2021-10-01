// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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
const app = initializeApp(firebaseConfig);

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

// When signed in, get the user ID
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    uid = user.uid;
  }
});

// setup the database
var db = firebase.firestore();

// Dummy code for now to set the database. This passes a subject ID, date and time to the 
// database
db.collection("tasks").doc('new_task').collection('subjects').doc(uid).set({
    subjectID: subjectID,  // this refers to the subject's ID from prolific
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
})
