import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBs-F5DsK-jlEPoCZkaVsXJBwt91OBoEBg",
  authDomain: "aqualife2024-4b5fd.firebaseapp.com",
  projectId: "aqualife2024-4b5fd",
  storageBucket: "aqualife2024-4b5fd.appspot.com",
  messagingSenderId: "642616945035",
  appId: "1:642616945035:web:YOUR_APP_ID"  // Reemplaza "YOUR_APP_ID" con tu ID de aplicación si lo tienes.
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
