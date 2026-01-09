import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD3v3wjwDE9N_yCZ4P3Rr2DqqUpojiKAJE",
  authDomain: "gallery-app-972f9.firebaseapp.com",
  projectId: "gallery-app-972f9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = "test@gallery-app.com";
const password = "Test123456!";

try {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  console.log("✅ Utente creato con successo!");
  console.log("📧 Email:", email);
  console.log("🔑 Password:", password);
  console.log("🆔 UID:", userCredential.user.uid);
  process.exit(0);
} catch (error) {
  if (error.code === 'auth/email-already-in-use') {
    console.log("ℹ️  Utente già esistente");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
  } else {
    console.error("❌ Errore:", error.message);
  }
  process.exit(0);
}
