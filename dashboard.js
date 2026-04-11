// 1. Import all necessary Firebase and Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove, getDoc, deleteDoc, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Your Firebase Configuration (Paste your actual config here)
const firebaseConfig = {
  apiKey: "AIzaSyBMKbwtnMliER7lGNbksSMHj5SIv_vE5xk",
  authDomain: "public-gallery-4d0f0.firebaseapp.com",
  databaseURL: "https://public-gallery-4d0f0-default-rtdb.firebaseio.com",
  projectId: "public-gallery-4d0f0",
  storageBucket: "public-gallery-4d0f0.firebasestorage.app",
  messagingSenderId: "392227239650",
  appId: "1:392227239650:web:40cc1d3b0fd7fffcec10bb"
};
// 3. Initialize Firebase FIRST (This creates the 'app' variable)
const app = initializeApp(firebaseConfig);

// 4. Initialize Auth and Firestore AFTER the app is ready
const auth = getAuth(app);
const db = getFirestore(app);

// Replace your old Firebase Storage logic with this Cloudinary Widget
const cloudName = "dwam61eqb"; // Replace with your Cloud Name
const uploadPreset = "public_share"; // Replace with your Unsigned Preset

const myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "dwam61eqb",
    uploadPreset: "public_share",
    sources: ["local", "url", "camera"], // Allows uploads from computer or camera
    multiple: false,
    cropping: true, // Professional touch: allows users to crop photos
    styles: {
        palette: {
            window: "#000000",
            sourceBg: "#000000",
            windowBorder: "#333333",
            tabIcon: "#FFFFFF",
            inactiveTabIcon: "#8E8E8E",
            menuIcons: "#FFFFFF",
            link: "#00d2ff",
            action: "#336BFF",
            inProgress: "#00BFFF",
            complete: "#33ff00",
            error: "#EA2727",
            textDark: "#000000",
            textLight: "#FFFFFF"
        }
    }
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
        const sharedUrl = result.info.secure_url
      console.log("Done!Image link: ", sharedUrl);
      

      savePostToDatabase(sharedUrl); // Save the post to your database with the image URL
      
     if (typeof createPost === "function") {
      createPost(sharedUrl, "You"); 
      
      alert("Successfully uploaded to Cloudinary!");
    }
    }
  }
);

document.getElementById("upload_widget").addEventListener("click", () => {
    myWidget.open();
}, false);

// Toggle Menu Visibility
const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');

menuToggle.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Close menu when clicking outside
window.onclick = (event) => {
    if (!event.target.matches('#menuToggle') && !event.target.matches('.fa-bars')) {
        dropdownMenu.style.display = 'none';
    }
}

// Contact Us Info
document.getElementById('contactBtn').addEventListener('click', () => {
    alert("Contact Us:\nEmail: rmustafizur854@gmail.com\nPhone: +91 9864321809");
});

// About Us Info
document.getElementById('aboutBtn').addEventListener('click', () => {
    alert("Public Share is a secure platform for sharing your life with the world safely.");
});

// Upload Trigger (Redirects to file selection)
const uploadBtn = document.getElementById('upload_widget'); 


if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        myWidget.open(); // This opens the Cloudinary window
    }, false);
}
    

    try {
        console.log("Upload started...");
        
        

        
        alert("Upload Successful! Your photo is now live.");
        console.log("File available at:", downloadURL);
        auth.currentUser.displayName || "User"

        // Optional: Refresh the page or add the image to the feed
        location.reload(); 

    } catch (error) {

    }
;

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    // auth.signOut();
    window.location.href = "index.html";
});

// Delete Account
document.getElementById('deleteAccountBtn').addEventListener('click', (e) => {
    e.preventDefault();
    deleteAccount();
});
const mediaFeed = document.getElementById('mediaFeed');

// dashboard.js

function createPost(url, username, postId, likes = [], comments = []) {
    // 1. Re-grab the element inside the function to be 100% sure it's there
    const mediaFeed = document.getElementById('mediaFeed');

    if (!mediaFeed) {
        console.error("Error: Could not find the 'mediaFeed' div in your HTML!");
        return;
    }

    const currentUserId = auth.currentUser?.uid;
    const hasLiked = likes.includes(currentUserId);

    const postHTML = `
        <div class="post-card" data-post-id="${postId}">
            <div class="post-header">
                <span class="username">@${username}</span>
            </div>
            <div class="post-content">
                <img src="${url}" alt="User Content">
            </div>
            <div class="post-footer">
                <button class="action-btn like-btn ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${postId}', ${hasLiked})"><i class="fa fa-heart"></i> <span class="like-count">${likes.length}</span></button>
                <button class="action-btn comment-btn" onclick="openCommentModal('${postId}', '${username}')"><i class="fa fa-comment"></i> <span class="comment-count">${comments.length}</span></button>
            </div>
        </div>
    `;

    // Append to the feed (since posts are ordered newest first, they display correctly)
    mediaFeed.innerHTML += postHTML;
}
async function savePostToDatabase(url) {
    try {
        await addDoc(collection(db, "posts"), {
            imageUrl: url,
            userId: auth.currentUser.uid,
            username: auth.currentUser.displayName || "Anonymous",
            timestamp: serverTimestamp(),
            likes: [],
            comments: []
        });
        console.log("Post saved to Firestore!");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    const mediaFeed = document.getElementById('mediaFeed');
    if (!mediaFeed) return;
    
    mediaFeed.innerHTML = ""; // Clear the feed before reloading
    snapshot.forEach((docSnapshot) => {
        const post = docSnapshot.data();
        const postId = docSnapshot.id;
        const likes = post.likes || [];
        const comments = post.comments || [];
        createPost(post.imageUrl, post.username, postId, likes, comments);
    });
});

// Like/Unlike functionality
async function toggleLike(postId, hasLiked) {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
        alert('Please login to like posts');
        return;
    }

    const postRef = doc(db, "posts", postId);
    
    try {
        if (hasLiked) {
            // Unlike
            await updateDoc(postRef, {
                likes: arrayRemove(currentUserId)
            });
        } else {
            // Like
            await updateDoc(postRef, {
                likes: arrayUnion(currentUserId)
            });
        }
    } catch (e) {
        console.error("Error updating like:", e);
    }
}

// Make toggleLike globally accessible
window.toggleLike = toggleLike;

// Comment Modal
function openCommentModal(postId, username) {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
        alert('Please login to comment');
        return;
    }

    const commentText = prompt(`Comment on @${username}'s post:`);
    if (commentText && commentText.trim()) {
        addComment(postId, commentText);
    }
}

// Add comment to post
async function addComment(postId, commentText) {
    const currentUserId = auth.currentUser?.uid;
    const username = auth.currentUser?.displayName || 'Anonymous';
    
    if (!currentUserId) return;

    const postRef = doc(db, "posts", postId);
    
    try {
        // First, get the post to check if comments array exists
        const postSnap = await getDoc(postRef);
        
        if (!postSnap.exists()) {
            alert("Post not found!");
            return;
        }

        const postData = postSnap.data();
        let comments = postData.comments || [];
        
        // Create a new comment object
        const newComment = {
            userId: currentUserId,
            username: username,
            text: commentText.trim(),
            timestamp: new Date().toISOString()
        };
        
        // Add the new comment to the array
        comments.push(newComment);
        
        // Update the post with the new comments array
        await updateDoc(postRef, {
            comments: comments
        });
        
        console.log("Comment added successfully!");
        alert("Comment added!");
    } catch (e) {
        console.error("Error adding comment:", e);
        alert("Failed to add comment. Please try again.");
    }
}

window.openCommentModal = openCommentModal;

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