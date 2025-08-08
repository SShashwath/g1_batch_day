import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAAqO-mlCezqkM1fXIBXEd5Pvl1MPYogI0",
  authDomain: "g1-batch-day.firebaseapp.com",
  projectId: "g1-batch-day",
  storageBucket: "g1-batch-day.firebasestorage.app",
  messagingSenderId: "815558749844",
  appId: "1:815558749844:web:4d188fe998d33c68e10e81",
  measurementId: "G-T0SWNW1YHR"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
