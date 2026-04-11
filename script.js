// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBMKbwtnMliER7lGNbksSMHj5SIv_vE5xk",
  authDomain: "public-gallery-4d0f0.firebaseapp.com",
  databaseURL: "https://public-gallery-4d0f0-default-rtdb.firebaseio.com",
  projectId: "public-gallery-4d0f0",
  storageBucket: "public-gallery-4d0f0.firebasestorage.app",
  messagingSenderId: "392227239650",
  appId: "1:392227239650:web:40cc1d3b0fd7fffcec10bb"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();



// Google Sign In Function
export const googleSignIn = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Create or update user document in Firestore
        try {
            await setDoc(doc(db, "users", user.uid), {
                username: user.displayName || "Google User",
                email: user.email,
                uid: user.uid,
                photo: user.photoURL || null
            }, { merge: true });
        } catch (firestoreError) {
            console.error("Error creating user document:", firestoreError);
        }
        
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Google Sign In Error:", error);
        alert("Google Sign In failed. Please try again.");
    }
};

// Reset Password (Forgot Password)
export const resetPassword = (email) => {
    sendPasswordResetEmail(auth, email)
    .then(() => alert("Reset link sent to Gmail!"));
};

import { 
    createUserWithEmailAndPassword, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Sign Up Logic
const createAccBtn = document.getElementById('createAccBtn');

if (createAccBtn) {
    createAccBtn.addEventListener('click', () => {
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const pass = document.getElementById('userPass').value;
        const confirmPass = document.getElementById('confirmPass').value;

        // 1. Check if passwords match
        if (pass !== confirmPass) {
            alert("Passwords do not match!");
            return;
        }

        // 2. Create User in Firebase
        createUserWithEmailAndPassword(auth, email, pass)
            .then(async (userCredential) => {
                // 3. Update the profile with the Name provided
                await updateProfile(userCredential.user, {
                    displayName: name
                });
                
                // 4. Create a user document in Firestore
                try {
                    await setDoc(doc(db, "users", userCredential.user.uid), {
                        username: name,
                        email: email,
                        uid: userCredential.user.uid,
                        createdAt: new Date().toISOString()
                    });
                    alert("Account Created Successfully!");
                    window.location.href = "dashboard.html";
                } catch (firestoreError) {
                    console.error("Error creating user document:", firestoreError);
                    alert("Account created but profile setup failed. Please try editing your profile.");
                    window.location.href = "dashboard.html";
                }
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// Grab the Login Elements
const loginBtn = document.getElementById('loginBtn');
const emailInput = document.getElementById('loginEmail');
const passInput = document.getElementById('loginPassword');

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passInput.value;

        // Firebase Login Method
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Success! Redirect to dashboard
                console.log("Logged in:", userCredential.user);
                window.location.href = "dashboard.html"; 
            })
            .catch((error) => {
                // Handle errors (wrong password, user not found, etc.)
                const errorCode = error.code;
                const errorMessage = error.message;
                alert("Login Error: " + errorMessage);
            });
    });
}