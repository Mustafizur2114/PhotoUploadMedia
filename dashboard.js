// 1. Import all necessary Firebase and Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const mediaFeed = document.getElementById('mediaFeed');

// dashboard.js

function createPost(url, username) {
    // 1. Re-grab the element inside the function to be 100% sure it's there
    const mediaFeed = document.getElementById('mediaFeed');

    if (!mediaFeed) {
        console.error("Error: Could not find the 'mediaFeed' div in your HTML!");
        return;
    }

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
            </div>
        </div>
    `;

    // 2. This is line 132 - it will now work safely
    mediaFeed.innerHTML = postHTML + mediaFeed.innerHTML;
}
async function savePostToDatabase(url) {
    try {
        await addDoc(collection(db, "posts"), {
            imageUrl: url,
            username: auth.currentUser.displayName || "Anonymous",
            timestamp: serverTimestamp()
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
    snapshot.forEach((doc) => {
        const post = doc.data();
        createPost(post.imageUrl, post.username);
    });
});