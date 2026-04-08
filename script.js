const firebaseConfig = {
  apiKey: "AIzaSyBMKbwtnMliER7lGNbksSMHj5SIv_vE5xk",
  authDomain: "public-gallery-4d0f0.firebaseapp.com",
  projectId: "public-gallery-4d0f0",
  storageBucket: "public-gallery-4d0f0.firebasestorage.app",
  messagingSenderId: "392227239650",
  appId: "1:392227239650:web:40cc1d3b0fd7fffcec10bb"
};
;

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, uploadBytesResumable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getFirestore, collection, addDoc, query, orderBy, getDocs, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        showUserUI();
    } else {
        localStorage.removeItem('user');
        showGuestUI();
    }
});

function showUserUI() {
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.user-only').forEach(el => el.style.display = 'block');
}

function showGuestUI() {
    document.querySelectorAll('.user-only').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'block');
}

// REGISTER
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Registered! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message);
    }
});

// LOGIN
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginUsername').value; // Using email as username
    const password = document.getElementById('loginPassword').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert(error.message);
    }
});

// LOGOUT
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
});

// UPLOAD
const uploadForm = document.getElementById('uploadForm');
uploadForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = document.getElementById('mediaFile').files[0];
    const caption = document.getElementById('caption').value;
    
    if (!file) return alert('Select a file');
    
    const storageRef = ref(storage, `public/${file.name + Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Progress
    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
        },
        (error) => alert(error.message),
        async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save to Firestore
            await addDoc(collection(db, "media"), {
                url: url,
                caption: caption,
                filename: file.name,
                uploadedBy: auth.currentUser.email,
                createdAt: serverTimestamp()
            });
            
            alert('Upload complete!');
            uploadForm.reset();
            loadGallery();
        }
    );
});

// LOAD GALLERY
async function loadGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;
    
    const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    container.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'media-card';
        card.innerHTML = `
            ${data.url.includes('.mp4') || data.url.includes('.webm') ? 
                `<video src="${data.url}" class="media-video" controls muted></video>` :
                `<img src="${data.url}" alt="${data.caption}" class="media-thumbnail">`
            }
            <div class="media-info">
                <div class="media-caption">${data.caption || 'No caption'}</div>
                <div class="media-date">by ${data.uploadedBy}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Drag & Drop (same as before)
const fileInput = document.getElementById('mediaFile');
const fileDrop = document.querySelector('.file-drop');
if (fileDrop) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDrop.addEventListener(eventName, preventDefaults, false);
    });
    fileDrop.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
function handleDrop(e) {
    const dt = e.dataTransfer;
    fileInput.files = dt.files;
}

// Load gallery on page load
if (document.getElementById('galleryContainer')) loadGallery();

// Check auth state on load
const savedUser = localStorage.getItem('user');
if (savedUser) showUserUI();