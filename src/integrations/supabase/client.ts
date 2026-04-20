import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8mRK6WzTVfN_iTVPcW319GKUaTSL8gwo",
  authDomain: "nexuscore-4c191.firebaseapp.com",
  projectId: "nexuscore-4c191",
  storageBucket: "nexuscore-4c191.firebasestorage.app",
  messagingSenderId: "439441997971",
  appId: "1:439441997971:web:86ea28a43a1bf0c2c38d66",
  measurementId: "G-7CWTYYP29H"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Exportando como 'supabase' para o resto do código não quebrar
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
  })
};
