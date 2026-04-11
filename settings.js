import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc, deleteDoc, collection, query, where, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// Your Firebase Config
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

document.getElementById('save-btn').addEventListener('click', async () => {
    const newName = document.getElementById('username-input').value;
    const user = auth.currentUser;

    if (user && newName) {
        try {
            const userRef = doc(db, "users", user.uid);
            // Use setDoc with merge to create document if it doesn't exist
            await setDoc(userRef, { username: newName }, { merge: true });
            alert("Username updated!");
            window.location.href = "profile.html";
        } catch (e) {
            console.error("Update failed", e);
            alert("Failed to update username. Please try again.");
        }
    }
});

// Delete Account Button
document.getElementById('deleteAccountBtn').addEventListener('click', (e) => {
    e.preventDefault();
    deleteAccount();
});

// Delete Account Function
async function deleteAccount() {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone. All your posts and data will be deleted.');
    
    if (!confirmed) return;
    
    const doubleConfirm = confirm('This is your last chance. Type OK in the next prompt to confirm deletion.');
    if (!doubleConfirm) return;
    
    const finalConfirm = prompt('Type OK to confirm account deletion:');
    if (finalConfirm !== 'OK') {
        alert('Account deletion cancelled.');
        return;
    }

    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('No user logged in');
            return;
        }

        const userId = currentUser.uid;
        const username = currentUser.displayName || 'Anonymous';
        
        // Delete all posts by this user (by userId)
        const postsQuery = query(collection(db, "posts"), where("userId", "==", userId));
        const postsSnapshot = await getDocs(postsQuery);
        
        for (const postDoc of postsSnapshot.docs) {
            await deleteDoc(postDoc.ref);
        }
        
        // Also delete posts by username (in case posts were created before userId field was added)
        const postsQueryByUsername = query(collection(db, "posts"), where("username", "==", username));
        const postsSnapshotByUsername = await getDocs(postsQueryByUsername);
        
        for (const postDoc of postsSnapshotByUsername.docs) {
            await deleteDoc(postDoc.ref);
        }
        
        // Delete user document from Firestore
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
        
        // Delete user from Firebase Auth
        await deleteUser(currentUser);
        
        alert('Account deleted successfully. All your posts have been removed. You will be redirected to the home page.');
        window.location.href = "index.html";
        
    } catch (error) {
        console.error("Error deleting account:", error);
        if (error.code === 'auth/requires-recent-login') {
            alert('For security reasons, please log out and log back in before deleting your account.');
        } else {
            alert('Error deleting account: ' + error.message);
        }
    }
}