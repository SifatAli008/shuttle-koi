import { 
    auth, provider, ref, set, onValue, database 
} from "../firebase/firebase-config.js";
import { signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Initialize Leaflet map
let map = L.map('map').setView([23.685, 90.3563], 7); // Centered on Bangladesh
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markers = {};
let locationWatcher = null;
let isSharing = false;

// UI Elements
const logoutBtn = document.getElementById("logout");
const shareLocationBtn = document.getElementById("shareLocation");
const locationControls = document.getElementById("location-controls");
const activeUsers = document.getElementById("active-users");
const locationStatus = document.getElementById("location-status");
const usersList = document.getElementById("users-list");

// Google Login
document.getElementById("googleLogin")?.addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then(() => {
            showAuthenticatedUI();
        })
        .catch((error) => {
            console.error("Google Login Error:", error);
            showError("Login failed: " + error.message);
        });
});

// Logout
logoutBtn?.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            hideAuthenticatedUI();
            stopLocationSharing();
        })
        .catch((error) => {
            console.error("Logout Error:", error);
            showError("Logout failed: " + error.message);
        });
});

// Share Location
shareLocationBtn?.addEventListener("click", () => {
    if (!isSharing) {
        startLocationSharing();
    } else {
        stopLocationSharing();
    }
});

function startLocationSharing() {
    if (navigator.geolocation) {
        shareLocationBtn.classList.remove('btn-success');
        shareLocationBtn.classList.add('btn-danger');
        shareLocationBtn.textContent = 'Stop Sharing Location';
        isSharing = true;

        locationWatcher = navigator.geolocation.watchPosition(
            (position) => {
                if (auth.currentUser) {
                    const { latitude, longitude } = position.coords;
                    const userId = auth.currentUser.uid;
                    const userData = {
                        latitude,
                        longitude,
                        timestamp: Date.now(),
                        displayName: auth.currentUser.displayName || 'Anonymous',
                        photoURL: auth.currentUser.photoURL || 'https://via.placeholder.com/40'
                    };

                    set(ref(database, "locations/" + userId), userData);
                    updateLocationStatus("Successfully sharing location");
                }
            },
            (error) => {
                console.error("Geolocation Error:", error);
                showError("Error getting location: " + error.message);
                stopLocationSharing();
            },
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    } else {
        showError("Geolocation is not supported by this browser.");
    }
}

function stopLocationSharing() {
    if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
        locationWatcher = null;
    }
    if (auth.currentUser) {
        set(ref(database, "locations/" + auth.currentUser.uid), null);
    }
    shareLocationBtn.classList.remove('btn-danger');
    shareLocationBtn.classList.add('btn-success');
    shareLocationBtn.textContent = 'Start Sharing Location';
    isSharing = false;
    updateLocationStatus("Location sharing stopped");
}

// Listen for location updates
onValue(ref(database, "locations"), (snapshot) => {
    const data = snapshot.val() || {};
    updateUsersUI(data);
    updateMapMarkers(data);
});

function updateUsersUI(data) {
    usersList.innerHTML = '';
    Object.entries(data).forEach(([userId, userData]) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-list-item';
        userItem.innerHTML = `
            <img src="${userData.photoURL}" alt="${userData.displayName}" class="user-avatar">
            <div class="user-info">
                <div class="fw-bold">${userData.displayName}</div>
                <small class="text-muted">Last updated: ${new Date(userData.timestamp).toLocaleTimeString()}</small>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

function updateMapMarkers(data) {
    // Remove old markers
    Object.keys(markers).forEach(key => {
        if (!data[key]) {
            map.removeLayer(markers[key]);
            delete markers[key];
        }
    });

    // Update/Add new markers
    Object.entries(data).forEach(([userId, userData]) => {
        const { latitude, longitude, photoURL, displayName } = userData;

        const userIcon = L.divIcon({
            className: 'location-marker',
            html: `<img src="${photoURL}" alt="${displayName}" class="user-avatar">`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        if (markers[userId]) {
            markers[userId].setLatLng([latitude, longitude]);
        } else {
            markers[userId] = L.marker([latitude, longitude], { icon: userIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="text-center">
                        <img src="${photoURL}" class="user-avatar mb-2" alt="${displayName}">
                        <div class="fw-bold">${displayName}</div>
                        <small class="text-muted">
                            Lat: ${latitude.toFixed(4)}<br>
                            Lng: ${longitude.toFixed(4)}
                        </small>
                    </div>
                `);
        }
    });
}

function showAuthenticatedUI() {
    document.getElementById("login-section").classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    locationControls.classList.remove("hidden");
    activeUsers.classList.remove("hidden");
}

function hideAuthenticatedUI() {
    document.getElementById("login-section").classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    locationControls.classList.add("hidden");
    activeUsers.classList.add("hidden");
}

function updateLocationStatus(message) {
    locationStatus.textContent = message;
}

function showError(message) {
    // You could enhance this with Bootstrap alerts
    alert(message);
}

// Check initial auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        showAuthenticatedUI();
    } else {
        hideAuthenticatedUI();
    }
});