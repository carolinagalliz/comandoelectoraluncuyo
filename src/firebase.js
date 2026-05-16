import { initializeApp } from "firebase/app";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

import {
  getFirestore,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrUXO_iN6i1CQAzC7MegmOceuiVrcjfGs",
  authDomain: "re-elecciones-uncuyo.firebaseapp.com",
  projectId: "re-elecciones-uncuyo",
  storageBucket: "re-elecciones-uncuyo.firebasestorage.app",
  messagingSenderId: "113401549037",
  appId: "1:113401549037:web:8d3085943a3a251d987ce4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);

export { serverTimestamp };