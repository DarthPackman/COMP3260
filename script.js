/* ----------------------------------------------------------------------------- FIREBASE SETUP -------------------------------------------------------------------------- */

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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

/* ----------------------------------------------------------------------------- GLOBAL VARIABLES ----------------------------------------------------------------------- */

let userScore = 100;
let mouseMoved = false;
let keyPressed = false;
let captchaTrigger = false;
const startTime = Date.now();
let idleTime = 0;
const maxIdleTime = 5;

/* ----------------------------------------------------------------------------- UTILITY FUNCTIONS --------------------------------------------------------------------- */

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

function resetIdleTimer() {
    idleTime = 0;
}

/* ----------------------------------------------------------------------------- AUTHENTICATION FUNCTIONS ------------------------------------------------------------- */

/* ----------------------------------------------------------------------------- AUTHENTICATION FUNCTIONS ------------------------------------------------------------- */

/* Sign Up Function */
async function signupUser(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User created successfully:', user);
        const ipAddress = await fetchIPAddress();
        await db.ref('users/' + user.uid).set({
            email: user.email,
            ipAddress: ipAddress,
            lastLogin: Date.now(),
            captchaTriggerCount: 0, 
            ipChangeCount: 0
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
        
        const userRef = db.ref('users/' + user.uid);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        const ipAddress = await fetchIPAddress();
        let captchaTriggerCount = userData.captchaTriggerCount || 0;
        
        if (captchaTrigger) { 
            captchaTriggerCount += 1;
            if (captchaTriggerCount >= 3) {
                await lockAccount();
                await auth.signOut();
                return;
            }
        }

        if (userData.accountLock) {
            console.log('Account is locked.');
            document.getElementById('errorMessage').textContent = 'Your account has been locked due to security concerns. Please reset your password.';
            await auth.signOut();
            return;  
        }

        await userRef.update({
            ipAddress: ipAddress,
            lastLogin: Date.now(),
            captchaTriggerCount: captchaTriggerCount
        });
        window.location.href = '/loggedIn.html';
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('errorMessage').textContent = error.message;
    }
}

/* Log Out Function */
function logoutUser() {
    auth.signOut().then(() => {
        window.location.href = '/index.html';
    }).catch(error => {
        console.error('Logout error:', error);
    });
}

/* Display Data Function */
function displayUserData() {
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('userEmail').textContent = user.email;
            db.ref('users/' + user.uid).once('value').then(snapshot => {
                const userData = snapshot.val();
                document.getElementById('userIP').textContent = userData.ipAddress || 'Unknown';
                document.getElementById('lastLoginTime').textContent = new Date(userData.lastLogin).toLocaleString();
                document.getElementById('captchaTriggerCount').textContent = userData.captchaTriggerCount || 0;
                document.getElementById('ipChangeCount').textContent = userData.ipChangeCount || 0;
            });
        } else {
            window.location.href = '/index.html';
        }
    });
}

/* ----------------------------------------------------------------------------- SECURITY FUNCTIONS ------------------------------------------------------------------- */

function evaluateUserBehavior() {
    const timeSpent = Date.now() - startTime;
    if (!mouseMoved) userScore -= 25;
    if (!keyPressed) userScore -= 25;
    if (timeSpent < 3000) userScore -= 25;
    if (userScore <= 50) {
        captchaTrigger = true;
    }
}

function showCaptchaModal() {
    document.getElementById("captchaModal").style.display = "flex";
}

function closeCaptchaModal() {
    document.getElementById("captchaModal").style.display = "none";
}

function validateCaptchaSelection() {
    const selectedOption = document.querySelector('input[name="captchaOption"]:checked');
    const captchaErrorMessage = document.getElementById("captchaErrorMessage");

    if (selectedOption) {
        if (selectedOption.dataset.correct === "true") {
            closeCaptchaModal();
            loginUser(document.getElementById('username').value, document.getElementById('password').value);
        } else {
            captchaErrorMessage.textContent = "Incorrect selection. Please try again.";
        }
    } else {
        captchaErrorMessage.textContent = "Please select an option.";
    }
}

async function IPAddressChangedLogOut() {
    const currentIPAddress = await fetchIPAddress();
    const user = auth.currentUser;
    if (user) {
        const previousIPAddress = document.getElementById('userIP').textContent;
        if (currentIPAddress !== previousIPAddress) {
            const userRef = db.ref('users/' + user.uid);
            const snapshot = await userRef.once('value');
            const ipChangeCount = snapshot.val().IpChangeCount || 0;
            await userRef.update({
                ipAddress: currentIPAddress,
                ipChangeCount: ipChangeCount + 1
            });
            if (ipChangeCount > 3) lockAccount();
            logoutUser();
        }
    }
}

async function lockAccount() {
    const user = auth.currentUser;
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        await userRef.update({
            accountLock: true,
            ipChangeCount: 0,
            captchaTriggerCount: 0
        });
    }
}

async function resetPassword() {
    const email = document.getElementById('username').value;
    if (!email) {
        alert('Please enter your email address to reset your password.');
        return;
    }
    try {
        await auth.sendPasswordResetEmail(email);
        alert('Password reset email sent! Check your inbox.');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        alert('Error: ' + error.message);
    }
}

async function unlockAccount() {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
        alert('Please enter your email and password to unlock your account.');
        return;
    }
    resetPassword();
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        await userRef.update({
            accountLock: false,
        });
        await auth.signOut();
    }
}

/* ----------------------------------------------------------------------------- CAPTCHA FUNCTIONS ------------------------------------------------------------------- */

const images1 = [
    { src: 'image1.jpg', correct: false },
    { src: 'image2.jpg', correct: false },
    { src: 'image3.jpg', correct: true },
    { src: 'image4.jpg', correct: false }
];
const images2 = [
    { src: 'image5.jpg', correct: false },
    { src: 'image6.jpg', correct: false },
    { src: 'image7.jpg', correct: false },
    { src: 'image8.jpg', correct: true }
];
const images3 = [
    { src: 'image9.jpg', correct: true },
    { src: 'image10.jpg', correct: false },
    { src: 'image11.jpg', correct: false },
    { src: 'image12.jpg', correct: false }
];
const imgStack = [images1, images2, images3];
let randomIndex = Math.floor(Math.random() * imgStack.length);
let randomImages = imgStack[randomIndex];

function moveCorrectImage(images) {
    const ImageIndex = 0;
    const randomIdx = Math.floor(Math.random() * images.length);
    [images[ImageIndex], images[randomIdx]] = [images[randomIdx], images[ImageIndex]];
    return images;
}

function loadImages() {
    const updatedImages = moveCorrectImage(randomImages);
    const imageElements = document.querySelectorAll('.image-container img');
    const optionLabels = document.querySelectorAll('.captcha-options input');

    imageElements.forEach((imgElement, index) => {
        imgElement.src = updatedImages[index].src;
        imgElement.dataset.correct = updatedImages[index].correct;
    });
    optionLabels.forEach((input, index) => {
        input.value = index + 1;
        if (updatedImages[index].correct) {
            input.dataset.correct = "true";
        } else {
            input.removeAttribute('data-correct');
        }
    });
}
loadImages();

/* ----------------------------------------------------------------------------- EVENT LISTENERS -------------------------------------------------------------------- */

document.addEventListener('mousemove', () => { mouseMoved = true; });
document.addEventListener('keypress', () => { keyPressed = true; });

document.addEventListener("DOMContentLoaded", function() {
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

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            document.getElementById('errorMessage').textContent = '';
            evaluateUserBehavior();
            if (captchaTrigger) {
                showCaptchaModal();
            } else {
                loginUser(email, password);
            }
        });
    }

    if (document.getElementById('welcomeMessage')) {
        displayUserData();
        document.addEventListener('keypress', IPAddressChangedLogOut);
        document.addEventListener('click', IPAddressChangedLogOut);
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('keypress', resetIdleTimer);
        document.addEventListener('click', resetIdleTimer);
        document.addEventListener('scroll', resetIdleTimer);
        if (idleTime >= maxIdleTime) {
            logoutUser();
        }
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }

    const resetPasswordButton = document.getElementById('resetPasswordButton');
    if (resetPasswordButton) {
        resetPasswordButton.addEventListener('click', resetPassword);
    }

    const unlockAccountButton = document.getElementById('unlockAccountButton');
    if (unlockAccountButton) {
        unlockAccountButton.addEventListener('click', unlockAccount);
    }
});
