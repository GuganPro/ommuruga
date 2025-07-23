// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "om-muruga-online",
  appId: "1:696999237596:web:b652fe4260acaf08992119",
  storageBucket: "om-muruga-online.appspot.com",
  apiKey: "AIzaSyDzOpRrTzinXCQSq_8ZrfvbnatKCaMnpQA",
  authDomain: "om-muruga-online.firebaseapp.com",
  messagingSenderId: "696999237596"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
