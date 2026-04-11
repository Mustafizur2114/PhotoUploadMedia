import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, query, where, onSnapshot, deleteDoc, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMKbwtnMliER7lGNbksSMHj5SIv_vE5xk",
  authDomain: "public-gallery-4d0f0.firebaseapp.com",
  databaseURL: "https://public-gallery-4d0f0-default-rtdb.firebaseio.com",
  projectId: "public-gallery-4d0f0",
  storageBucket: "public-gallery-4d0f0.firebasestorage.app",
  messagingSenderId: "392227239650",
  appId: "1:392227239650:web:40cc1d3b0fd7fffcec10bb"
};

// CRITICAL: Initialize Firebase first!
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
}

// Close menu when clicking outside
window.onclick = (event) => {
    if (dropdownMenu && !event.target.matches('#menuToggle') && !event.target.matches('.fa-bars')) {
        dropdownMenu.style.display = 'none';
    }
};

// Delete account button
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        deleteAccount();
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Fetch user info from Firestore
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById('displayUsername').innerText = userData.username || user.displayName || "New User";
            } else {
                document.getElementById('displayUsername').innerText = user.displayName || "New User";
            }
        } catch (e) {
            console.error("Error fetching user data:", e);
            document.getElementById('displayUsername').innerText = user.displayName || "New User";
        }
        
        document.getElementById('userEmailDisplay').innerText = user.email;

        // Fetch user-specific gallery from Firestore/Storage
        loadUserGallery(user.uid);
    } else {
        window.location.href = "auth.html";
    }
});

function loadUserGallery(userId) {
    const gallery = document.getElementById('userGallery');
    
    // Query posts where userId matches current user, ordered by timestamp (newest first)
    const q = query(collection(db, "posts"), where("userId", "==", userId), orderBy("timestamp", "desc"));
    
    onSnapshot(q, (snapshot) => {
        gallery.innerHTML = ""; // Clear gallery
        
        if (snapshot.empty) {
            gallery.innerHTML = '<p class="empty-msg">You haven\'t uploaded any photos yet.</p>';
        } else {
            snapshot.forEach((docSnapshot) => {
                const post = docSnapshot.data();
                const docId = docSnapshot.id;
                const imgHTML = `
                    <div class="gallery-item" onclick="openPhotoModal('${post.imageUrl}')">
                        <img src="${post.imageUrl}" alt="Gallery Photo" style="cursor: pointer;">
                        <button class="delete-btn" onclick="event.stopPropagation(); deletePhoto('${docId}')"><i class="fa fa-trash"></i></button>
                    </div>
                `;
                gallery.innerHTML += imgHTML;
            });
        }
    });
}

async function deletePhoto(docId) {
    if (confirm('Are you sure you want to delete this photo?')) {
        try {
            await deleteDoc(doc(db, "posts", docId));
            console.log("Photo deleted successfully!");
        } catch (e) {
            console.error("Error deleting photo:", e);
            alert("Failed to delete photo");
        }
    }
}

// Make modal functions globally accessible
window.deletePhoto = deletePhoto;

function openPhotoModal(imageUrl) {
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageUrl;
    modal.style.display = 'flex';
}

function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside the image
window.onclick = (event) => {
    const modal = document.getElementById('photoModal');
    if (event.target === modal) {
        closePhotoModal();
    }
};

window.openPhotoModal = openPhotoModal;
window.closePhotoModal = closePhotoModal;

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

window.deleteAccount = deleteAccount;