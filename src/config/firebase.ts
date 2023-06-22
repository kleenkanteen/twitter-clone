// Import the functions you need from the SDKs you need
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyWZ0q0X7VJRSVcpZLzvEQSCBo5-s6RS0",
  authDomain: "learn-react-e4942.firebaseapp.com",
  projectId: "learn-react-e4942",
  storageBucket: "learn-react-e4942.appspot.com",
  messagingSenderId: "811720628070",
  appId: "1:811720628070:web:1972e1cedea1385a709aa7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
