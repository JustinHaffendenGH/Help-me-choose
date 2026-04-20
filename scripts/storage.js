import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgHcpBctB7AU5XGrRu20YcIbPLuAISla4",
  authDomain: "decidr-1a5c4.firebaseapp.com",
  projectId: "decidr-1a5c4",
  storageBucket: "decidr-1a5c4.firebasestorage.app",
  messagingSenderId: "376436799457",
  appId: "1:376436799457:web:6297127907976118c184a0",
  measurementId: "G-5D23JH1Q0S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let authStateResolved = false;
const authCallbacks = [];

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  authStateResolved = true;
  console.log("Firebase Auth State Changed:", user ? user.email : "Logged Out");
  
  if (user) {
    // If logging in, attempt to merge any existing local favorites to the cloud automatically
    await _syncLocalToCloud(user.uid);
  }

  updateAuthUI();
  
  authCallbacks.forEach(cb => cb(user));
});

// Storage Service Wrapper
const StorageService = {
  onAuthChange: (cb) => {
    authCallbacks.push(cb);
    if (authStateResolved) cb(currentUser);
  },

  login: async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Error logging in: " + error.message);
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  getLists: async () => {
    if (!currentUser) {
      const raw = localStorage.getItem('decidr-lists') || '[]';
      try { return JSON.parse(raw); } catch(e) { return []; }
    }
    const docRef = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().lists || [];
    }
    return [];
  },

  saveLists: async (lists) => {
    if (!currentUser) {
      localStorage.setItem('decidr-lists', JSON.stringify(lists));
      return;
    }
    const docRef = doc(db, 'users', currentUser.uid);
    await setDoc(docRef, { lists }, { merge: true });
  },

  getFavorites: async (type = 'movies') => {
    // Legacy support logic
    const LEGACY_KEYS = { movies: 'favorites-movies', food: 'favorites-food', books: 'favorites-books' };
    const listKey = `decidr_${type}`; // e.g. decidr_movies

    if (!currentUser) {
      const raw = localStorage.getItem(listKey) || localStorage.getItem(LEGACY_KEYS[type]) || '[]';
      try { return JSON.parse(raw); } catch (e) { return []; }
    }

    // Cloud logic
    const docRef = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return data[listKey] || [];
    }
    return [];
  },

  saveFavorites: async (list, type = 'movies') => {
    const listKey = `decidr_${type}`;
    if (!currentUser) {
      localStorage.setItem(listKey, JSON.stringify(list));
      return;
    }
    
    const docRef = doc(db, 'users', currentUser.uid);
    await setDoc(docRef, { [listKey]: list }, { merge: true });
  }
};

async function _syncLocalToCloud(uid) {
  // Pull locally saved data to merge into cloud on first login
  const keys = ['movies', 'food', 'books'];
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  const cloudData = snap.exists() ? snap.data() : {};
  let requiresUpdate = false;

  for (const type of keys) {
    const listKey = `decidr_${type}`;
    const legacyKey = `favorites-${type}`;
    
    let localData = [];
    try {
      const raw = localStorage.getItem(listKey) || localStorage.getItem(legacyKey) || '[]';
      localData = JSON.parse(raw);
    } catch(e) {}

    if (localData && localData.length > 0) {
      const existingCloud = cloudData[listKey] || [];
      // Perform simple deduplication by ID
      const existingIds = new Set(existingCloud.map(i => i.id));
      const combined = [...existingCloud];
      
      localData.forEach(item => {
        if (!existingIds.has(item.id)) {
          combined.push(item);
          requiresUpdate = true;
        }
      });
      
      if (requiresUpdate) {
        cloudData[listKey] = combined;
        // Optionally clear local storage to prevent redundant syncs
        localStorage.removeItem(listKey);
        localStorage.removeItem(legacyKey);
      }
    }
  }

  if (requiresUpdate) {
    console.log("Syncing local favorites to cloud...");
    await setDoc(docRef, cloudData, { merge: true });
  }
}

// Global Nav Login/Logout Button UI update
function updateAuthUI() {
  const navbarNav = document.querySelector('.navbar-nav');
  if (!navbarNav) return;

  let authContainer = document.getElementById('auth-container');
  if (!authContainer) {
    authContainer = document.createElement('div');
    authContainer.id = 'auth-container';
    authContainer.style.display = 'flex';
    authContainer.style.alignItems = 'center';
    authContainer.style.gap = '0.5rem';
    authContainer.style.marginLeft = '1rem';
    
    // Insert right before theme toggle if it exists, otherwise append
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      navbarNav.insertBefore(authContainer, themeBtn);
    } else {
      navbarNav.appendChild(authContainer);
    }
  }

  if (currentUser) {
    // Logged in State
    authContainer.innerHTML = `
      <img src="${currentUser.photoURL || 'assets/default-avatar.png'}" alt="User Avatar" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--accent); object-fit: cover;">
      <button id="logout-btn" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 8px;">Log out</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', StorageService.logout);
  } else {
    // Logged out State
    authContainer.innerHTML = `
      <button id="login-btn" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 8px; background: rgba(108, 99, 255, 0.2);">☁️ Sign In</button>
    `;
    document.getElementById('login-btn').addEventListener('click', StorageService.login);
  }
}

// Make globally available
window.StorageService = StorageService;
