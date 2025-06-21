
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDhI8i5kimRPcJgEIKw0UmlaT2sN70Yazk",
    authDomain: "this-pro-done.firebaseapp.com",
    databaseURL: "https://this-pro-done-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "this-pro-done",
    storageBucket: "this-pro-done.firebasestorage.app",
    messagingSenderId: "735519750080",
    appId: "1:735519750080:web:226c4c7b1d7ba03420fa25",
    measurementId: "G-Y4N2ERD40J"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, addDoc, updateDoc, doc };

/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDhI8i5kimRPcJgEIKw0UmlaT2sN70Yazk",
    authDomain: "this-pro-done.firebaseapp.com",
    databaseURL: "https://this-pro-done-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "this-pro-done",
    storageBucket: "this-pro-done.firebasestorage.app",
    messagingSenderId: "735519750080",
    appId: "1:735519750080:web:226c4c7b1d7ba03420fa25",
    measurementId: "G-Y4N2ERD40J"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, addDoc, updateDoc, doc };
*/