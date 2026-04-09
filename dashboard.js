import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
// Update this line specifically to include 'ref'
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
const firebaseConfig = {
  apiKey: "AIzaSyBMKbwtnMliER7lGNbksSMHj5SIv_vE5xk",
  authDomain: "public-gallery-4d0f0.firebaseapp.com",
  databaseURL: "https://public-gallery-4d0f0-default-rtdb.firebaseio.com",
  projectId: "public-gallery-4d0f0",
  storageBucket: "public-gallery-4d0f0.firebasestorage.app",
  messagingSenderId: "392227239650",
  appId: "1:392227239650:web:40cc1d3b0fd7fffcec10bb"
};

// 2. INITIALIZE FIREBASE FIRST (This solves the error)
const app = initializeApp(firebaseConfig);

// 3. Now you can safely call these
const auth = getAuth(app);
const storage = getStorage(app);

console.log("Firebase initialized successfully!");

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
const fileUpload = document.getElementById('file-upload');

fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const user = auth.currentUser;

    if (!file) return;
    if (!user) {
        alert("Please login first to upload photos!");
        return;
    }
    // 1. Create a reference in Firebase Storage
    // This creates a folder named 'uploads', then a folder with the User's ID
    const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}-${file.name}`);

    try {
        console.log("Upload started...");
        
        // 2. Perform the actual upload
        const snapshot = await uploadBytes(storageRef, file);
        
        // 3. Get the URL of the uploaded image to display it
        const downloadURL = await getDownloadURL(snapshot.ref);
        createPost(downloadURL, user.displayName || "Anonymous");

        
        alert("Upload Successful! Your photo is now live.");
        console.log("File available at:", downloadURL);
        auth.currentUser.displayName || "User"

        // Optional: Refresh the page or add the image to the feed
        location.reload(); 

    } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed: " + error.message);
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    // auth.signOut();
    window.location.href = "index.html";
});
const mediaFeed = document.getElementById('mediaFeed');

// Function to create a post element
function createPost(url, username) {
    const postHTML = `
        <div class="post-card">
            <div class="post-header">
                <span class="username">@${username}</span>
            </div>
            <div class="post-content">
                <img src="${url}" alt="User Content">
            </div>
            <div class="post-footer">
                <button class="action-btn"><i class="fa fa-heart"></i> Like</button>
                <button class="action-btn"><i class="fa fa-comment"></i> Comment</button>
                <a href="${url}" download class="action-btn"><i class="fa fa-download"></i></a>
            </div>
        </div>
    `;
    mediaFeed.innerHTML += postHTML;
}