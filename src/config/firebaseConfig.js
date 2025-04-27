import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxPYtu2VWqDiHsw32XW-ZFdYkBHUqjmJc",
  authDomain: "campo-app-java.firebaseapp.com",
  projectId: "campo-app-java",
  storageBucket: "campo-app-java.firebasestorage.app",
  messagingSenderId: "796251294267",
  appId: "1:796251294267:web:461e3190ef82f20d746a1e",
  measurementId: "G-9BMS9EXCL6"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

export { db };
export default app;