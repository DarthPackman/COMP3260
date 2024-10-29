/* Firebase Stuff */
const firebaseConfig = {
    apiKey: "AIzaSyC8Rj5IX_nepovIWf4WxS7Qq1XFE6oQdtU",
    authDomain: "comp3260.firebaseapp.com",
    databaseURL: "https://comp3260-default-rtdb.firebaseio.com",
    projectId: "comp3260",
    storageBucket: "comp3260.appspot.com",
    messagingSenderId: "907200378583",
    appId: "1:907200378583:web:1eedbd0c2f20d42d4c6292",
    measurementId: "G-Q898GNTYMM"
};

alert("script.js loaded");

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

/* Get IP Function */
async function fetchIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return 'Unknown';
    }
}

/* Sign Up Function */
async function signupUser(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User created successfully:', user);

        const ipAddress = await fetchIPAddress();

        await db.ref('users/' + user.uid).set({
            email: user.email,
            ipAddress: ipAddress
        });

        window.location.href = '/index.html';
    } catch (error) {
        console.error('Sign-up error:', error);
        document.getElementById('errorMessage').textContent = error.message;
    }
}

/* Log In Function */
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('Login successful:', user);

        // Redirect to a welcome page or dashboard
        window.location.href = '/loggedIn.html';
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('errorMessage').textContent = error.message;
    }
}

/* Log Out Function */
function logoutUser() {
    auth.signOut().then(() => {
        // Redirect to login page after logging out
        window.location.href = '/index.html';
    }).catch(error => {
        console.error('Logout error:', error);
    });
}

/* Dispaly Data Function */
function displayUserData() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Display the user email
            document.getElementById('userEmail').textContent = user.email;

            // Fetch additional user details from the Realtime Database (IP address and last login time)
            db.ref('users/' + user.uid).once('value').then(snapshot => {
                const userData = snapshot.val();
                document.getElementById('userIP').textContent = userData.ipAddress || 'Unknown';
                document.getElementById('lastLoginTime').textContent = new Date(userData.lastLogin).toLocaleString();
            });
        } else {
            // Redirect to login if no user is authenticated
            window.location.href = '/login.html';
        }
    });
}

/* Page Listener */
document.addEventListener("DOMContentLoaded", function() {

    /* Sign Up Stuff */
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                document.getElementById('errorMessage').textContent = 'Passwords do not match!';
                return;
            }

            signupUser(email, password);
        });
    }

    /* Log in Stuff */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            document.getElementById('errorMessage').textContent = ''; 

            loginUser(email, password);
        });
    }

    /* Logged In Stuff */
    if (document.getElementById('welcomeMessage')) {
        displayUserData();
    }

    /* Log Out Stuff */
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }
});
