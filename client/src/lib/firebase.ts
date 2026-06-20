import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAawOH1WliSoOJNPKJbO0s08qOhanxLUf4",
  authDomain: "buildwithai-499306.firebaseapp.com",
  projectId: "buildwithai-499306",
  storageBucket: "buildwithai-499306.firebasestorage.app",
  messagingSenderId: "432200473806",
  appId: "1:432200473806:web:cb5da16264054a9eea049f",
  measurementId: "G-54Z15B715L"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
