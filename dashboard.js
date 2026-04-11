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
    // Close search results when clicking outside
    const searchResults = document.getElementById('searchResults');
    if (searchResults && !event.target.matches('#friendSearch') && !event.target.closest('.search-results')) {
        searchResults.style.display = 'none';
    }
}

// Search functionality
const friendSearch = document.getElementById('friendSearch');
const searchResults = document.getElementById('searchResults');

if (friendSearch) {
    friendSearch.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();
        
        if (searchTerm.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        try {
            // Get all users and filter client-side
            const usersRef = collection(db, "users");
            const querySnapshot = await getDocs(usersRef);
            
            searchResults.innerHTML = '';
            let found = false;
            
            querySnapshot.forEach((docSnapshot) => {
                const userData = docSnapshot.data();
                const userId = docSnapshot.id;
                const username = userData.username || '';
                const displayName = userData.displayName || '';
                const email = userData.email || '';
                
                // Check if username, displayName, or email contains search term
                if (username.toLowerCase().includes(searchTerm) || 
                    displayName.toLowerCase().includes(searchTerm) ||
                    email.toLowerCase().includes(searchTerm)) {
                    
                    found = true;
                    const searchItem = document.createElement('div');
                    searchItem.className = 'search-item';
                    searchItem.style.cssText = 'padding: 10px; cursor: pointer; border-bottom: 1px solid #333; transition: background 0.3s;';
                    
                    const displayUsername = username || displayName || email || 'Unknown User';
                    searchItem.innerText = '@' + displayUsername;
                    searchItem.onclick = () => viewUserProfile(userId, displayUsername);
                    searchItem.onmouseover = () => searchItem.style.background = '#222';
                    searchItem.onmouseout = () => searchItem.style.background = 'transparent';
                    
                    searchResults.appendChild(searchItem);
                }
            });
            
            if (!found) {
                searchResults.innerHTML = '<div class="search-item">No users found</div>';
            }
            
            searchResults.style.display = 'block';
        } catch (error) {
            console.error("Search error:", error);
            searchResults.innerHTML = '<div class="search-item">Error searching users</div>';
            searchResults.style.display = 'block';
        }
    });
}

// Contact Us Info
document.getElementById('contactBtn').addEventListener('click', () => {
    alert("Contact Us:\nEmail: rmustafizur854@gmail.com\nPhone: +91 9864321809");
});

// View User Profile
async function viewUserProfile(userId, username) {
    // Close search results
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('friendSearch').value = '';
    
    // Create profile modal
    const modal = document.createElement('div');
    modal.id = 'userProfileModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #1a1a1a;
        color: white;
        border-radius: 12px;
        padding: 30px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        border: 1px solid #333;
    `;
    
    // Loading state
    modalContent.innerHTML = '<p style="text-align: center; color: #888;">Loading profile...</p>';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", userId));
        const userEmail = userDoc.data()?.email || 'N/A';
        
        // Fetch user's posts
        const postsQuery = query(collection(db, "posts"), where("userId", "==", userId), orderBy("timestamp", "desc"));
        const postsSnapshot = await getDocs(postsQuery);
        
        // Build modal content
        let profileHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;"><i class="fa fa-user-circle"></i></div>
                <h2 style="margin: 10px 0;">@${username}</h2>
                <p style="color: #aaa; margin: 5px 0;">Email: ${userEmail}</p>
            </div>
            <hr style="border-color: #333; margin: 20px 0;">
            <h3 style="margin-bottom: 15px;"><i class="fa fa-th"></i> Gallery</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
        `;
        
        if (postsSnapshot.empty) {
            profileHTML += '<p style="grid-column: 1 / -1; text-align: center; color: #888;">No photos uploaded yet</p>';
        } else {
            postsSnapshot.forEach((postDoc) => {
                const post = postDoc.data();
                profileHTML += `
                    <img src="${post.imageUrl}" alt="Photo" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; cursor: pointer;" onclick="viewFullImage('${post.imageUrl}')">
                `;
            });
        }
        
        profileHTML += `
            </div>
            <button onclick="closeUserProfile()" style="
                width: 100%;
                padding: 12px;
                margin-top: 20px;
                background: #ff4d4d;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                font-size: 16px;
            ">Close</button>
        `;
        
        modalContent.innerHTML = profileHTML;
        
    } catch (error) {
        console.error("Error loading profile:", error);
        modalContent.innerHTML = '<p style="color: #ff4d4d;">Error loading profile. Please try again.</p>';
    }
}

// Close user profile modal
function closeUserProfile() {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.remove();
    }
}

// View full image
function viewFullImage(imageUrl) {
    const imageModal = document.createElement('div');
    imageModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
    `;
    
    imageModal.appendChild(img);
    imageModal.onclick = () => imageModal.remove();
    document.body.appendChild(imageModal);
}

// Make functions globally accessible
window.viewUserProfile = viewUserProfile;
window.closeUserProfile = closeUserProfile;
window.viewFullImage = viewFullImage;

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
async function openCommentModal(postId, username) {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
        alert('Please login to comment');
        return;
    }

    try {
        // Get post data with comments
        const postSnap = await getDoc(doc(db, "posts", postId));
        if (!postSnap.exists()) {
            alert("Post not found!");
            return;
        }
        
        const postData = postSnap.data();
        const comments = postData.comments || [];
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'commentsModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #1a1a1a;
            color: white;
            border-radius: 12px;
            padding: 20px;
            width: 90%;
            max-width: 500px;
            max-height: 600px;
            overflow-y: auto;
            border: 1px solid #333;
        `;
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Comments on @${username}'s post</h3>
                <button onclick="closeCommentModal()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <hr style="border-color: #333; margin-bottom: 15px;">
        `;
        
        if (comments.length === 0) {
            html += '<p style="text-align: center; color: #888;">No comments yet. Be the first to comment!</p>';
        } else {
            html += '<div style="margin-bottom: 15px;">';
            comments.forEach((comment) => {
                const date = new Date(comment.timestamp);
                const timeStr = date.toLocaleString();
                html += `
                    <div style="background: #222; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #00d2ff;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="font-weight: bold; color: #00d2ff;">@${comment.username}</span>
                            <span style="font-size: 12px; color: #888;">${timeStr}</span>
                        </div>
                        <p style="margin: 0; color: #aaa; word-wrap: break-word;">${escapeHtml(comment.text)}</p>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += `
            <hr style="border-color: #333; margin: 15px 0;">
            <div style="display: flex; gap: 10px;">
                <input type="text" id="commentInput" placeholder="Write a comment..." style="
                    flex: 1;
                    background: #222;
                    border: 1px solid #333;
                    color: white;
                    padding: 10px;
                    border-radius: 6px;
                    outline: none;
                " />
                <button onclick="submitComment('${postId}')" style="
                    background: #00d2ff;
                    color: black;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Post</button>
            </div>
        `;
        
        modalContent.innerHTML = html;
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Focus on input
        document.getElementById('commentInput').focus();
        
    } catch (error) {
        console.error("Error opening comment modal:", error);
        alert("Failed to load comments. Please try again.");
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Submit comment from modal
async function submitComment(postId) {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Please write a comment');
        return;
    }
    
    await addComment(postId, commentText);
    
    // Refresh modal
    closeCommentModal();
    openCommentModal(postId, 'User');
}

// Close comment modal
function closeCommentModal() {
    const modal = document.getElementById('commentsModal');
    if (modal) {
        modal.remove();
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
window.submitComment = submitComment;
window.closeCommentModal = closeCommentModal;
window.escapeHtml = escapeHtml;

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