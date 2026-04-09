import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Display user info
        document.getElementById('displayUsername').innerText = user.displayName || "New User";
        document.getElementById('userEmailDisplay').innerText = user.email;

        // Fetch user-specific gallery from Firestore/Storage
        loadUserGallery(user.uid);
    } else {
        window.location.href = "auth.html";
    }
});

function loadUserGallery(userId) {
    const gallery = document.getElementById('userGallery');
    // Here you would normally query Firestore for images where 'owner' == userId
    // For now, it stays empty until you upload files via Firebase Storage
}