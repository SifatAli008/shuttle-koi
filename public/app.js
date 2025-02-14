// public/app.js
import { 
    db, auth, provider, ref, set, onValue, signInWithPopup, 
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, 
    RecaptchaVerifier, signInWithPhoneNumber 
} from "../firebase/firebase-config.js";

// Initialize Leaflet map
let map = L.map('map').setView([23.685, 90.3563], 7); // Centered on Bangladesh
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markers = {};

// UI Elements
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const phoneLoginForm = document.getElementById("phoneLoginForm");
const logoutBtn = document.getElementById("logout");
const shareLocationBtn = document.getElementById("shareLocation");

// 🔹 **Google Login**
document.getElementById("googleLogin").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then(() => {
            shareLocationBtn.classList.remove("hidden");
        })
        .catch((error) => alert(error.message));
});

// 🔹 **Signup with Email & Password**
if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => alert("Signup successful! Please log in."))
            .catch((error) => alert(error.message));
    });
}

// 🔹 **Login with Email & Password**
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                shareLocationBtn.classList.remove("hidden");
            })
            .catch((error) => alert(error.message));
    });
}

// 🔹 **Phone Number Authentication**
if (phoneLoginForm) {
    document.getElementById("sendOTP").addEventListener("click", () => {
        let phoneNumber = document.getElementById("phoneNumber").value;
        if (!phoneNumber.startsWith("+880")) {
            alert("Please enter a valid Bangladesh phone number (+8801XXXXXXXXX).");
            return;
        }

        // Recaptcha
        window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
            size: "invisible"
        }, auth);

        signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                alert("OTP Sent! Enter OTP to verify.");
            })
            .catch((error) => alert(error.message));
    });

    document.getElementById("verifyOTP").addEventListener("click", () => {
        let otpCode = document.getElementById("otpCode").value;
        confirmationResult.confirm(otpCode)
            .then(() => {
                alert("Phone number verified successfully!");
                shareLocationBtn.classList.remove("hidden");
            })
            .catch(() => alert("Invalid OTP. Please try again."));
    });
}

// 🔹 **Logout**
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            alert("Logged out");
            shareLocationBtn.classList.add("hidden");
        }).catch((error) => alert(error.message));
    });
}

// 🔹 **Share Location**
if (shareLocationBtn) {
    shareLocationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition((position) => {
                if (auth.currentUser) {
                    const { latitude, longitude } = position.coords;
                    const userId = auth.currentUser.uid;
                    const profilePic = auth.currentUser.photoURL || 'https://via.placeholder.com/40';

                    set(ref(db, "locations/" + userId), {
                        latitude,
                        longitude,
                        timestamp: Date.now(),
                        profilePic
                    });
                }
            }, (error) => alert("Error fetching location: " + error.message));
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });
}

// 🔹 **Listen for updates and update the map**
onValue(ref(db, "locations"), (snapshot) => {
    const data = snapshot.val();
    for (const key in data) {
        const { latitude, longitude, profilePic } = data[key];

        // Create custom icon with user profile picture
        const userIcon = L.icon({
            iconUrl: profilePic,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        if (markers[key]) {
            markers[key].setLatLng([latitude, longitude]);
        } else {
            markers[key] = L.marker([latitude, longitude], { icon: userIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="text-align: center;">
                        <img src="${profilePic}" style="width: 50px; height: 50px; border-radius: 50%;" />
                        <p><b>User ${key}</b></p>
                        <p>Lat: ${latitude}, Lng: ${longitude}</p>
                    </div>
                `);
        }
    }
});
