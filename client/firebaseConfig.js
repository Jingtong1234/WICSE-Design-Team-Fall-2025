// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANEa6Jp0ZzWipXlcTxpo3iHXR6WPnjZHA",
  authDomain: "wicse-financial-app.firebaseapp.com",
  projectId: "wicse-financial-app",
  storageBucket: "wicse-financial-app.firebasestorage.app",
  messagingSenderId: "604080077449",
  appId: "1:604080077449:web:f11d54e1f7536fdfb9a458",
  measurementId: "G-0KB0YCL9VJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };