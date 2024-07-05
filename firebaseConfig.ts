import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";
import { getAuth } from "firebase/auth";


// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDgtGP9i6p2x2TkN4TygQ6r_c6L-An0cc0",
    authDomain: "chat-app-50d44.firebaseapp.com",
    databaseURL: "https://chat-app-50d44-default-rtdb.firebaseio.com",
    projectId: "chat-app-50d44",
    storageBucket: "chat-app-50d44.appspot.com",
    messagingSenderId: "824616525032",
    appId: "1:824616525032:web:89339143936cd3e1323d5d",
    measurementId: "G-H57RZRYPDX"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
