import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAsbLtV4B2Dlm0LpKnm_FRwbKRigAdF2uk",
    authDomain: "hierroproject-68af2.firebaseapp.com",
    projectId: "hierroproject-68af2",
    storageBucket: "hierroproject-68af2.firebasestorage.app",
    messagingSenderId: "661736862379",
    appId: "1:661736862379:web:7441225f3ef2a337973dee",
    measurementId: "G-0NCXFLZRX4"
  };

export const firebaseApp = initializeApp(firebaseConfig);
export const messaging = getMessaging(firebaseApp);
