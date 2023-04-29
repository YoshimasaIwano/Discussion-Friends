// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore"; // Import Firestore
import "firebase/compat/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIETQr_lyLCS8LnhnPQ-ME1mJei0zbFP8",
  authDomain: "discussion-friends.firebaseapp.com",
  projectId: "discussion-friends",
  storageBucket: "discussion-friends.appspot.com",
  messagingSenderId: "932315694562",
  appId: "1:932315694562:web:59838aee28b912cc87e5bb",
  measurementId: "G-H67JQK8CS0",
};

firebase.initializeApp(firebaseConfig); // Initialize Firebase
const firestore = firebase.firestore(); // Create Firestore instance

export { firebase, firestore }; 
