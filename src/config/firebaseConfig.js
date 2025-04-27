import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD41U09nX92noX5eIySXd6wbvXbYGkS13Q",
  authDomain: "projecttest-c14e2.firebaseapp.com",
  projectId: "projecttest-c14e2",
  storageBucket: "projecttest-c14e2.firebasestorage.app",
  messagingSenderId: "331612783725",
  appId: "1:331612783725:web:516985c2da5b02fb936b64",
  measurementId: "G-B0JFMZ7KR0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore para usar como base de datos
export const db = getFirestore(app);
export default app;