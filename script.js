/* ----------------------------------------------------------------------------- FIREBASE -------------------------------------------------------------------------- */

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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

/* ----------------------------------------------------------------------------- FUNCTIONS -------------------------------------------------------------------------- */

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
            ipAddress: ipAddress,
            lastLogin: Date.now()
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
        const snapshot = await db.ref('users/' + user.uid).once('value');
        const userData = snapshot.val();

        if (userData.accountLock) {
            console.log('Account is locked.');
            document.getElementById('errorMessage').textContent = 'Your account has been locked due to security concerns. Please reset your password.';
            await auth.signOut();
            return;  
        }

        const ipAddress = await fetchIPAddress();
        await db.ref('users/' + user.uid).update({
            ipAddress: ipAddress,
            lastLogin: Date.now(),
            failedAttempts: 0,
            accountLock: false,
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
            });
        } else {
            window.location.href = '/index.html';
        }
    });
}

/* Open CAPTCHA modal */
function showCaptchaModal() {
    document.getElementById("captchaModal").style.display = "flex";
}

/* Close CAPTCHA modal */
function closeCaptchaModal() {
    document.getElementById("captchaModal").style.display = "none";
}

/* Validate CAPTCHA */
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
randomIndex = Math.floor(Math.random() * imgStack.length);
randomImages = imgStack[randomIndex];
function moveCorrectImage(randomImages) {
    const ImageIndex = 0;
    const randomIndex = Math.floor(Math.random() * randomImages.length);

    // Swap the correct image with the random index
    [randomImages[ImageIndex], randomImages[randomIndex]] = [randomImages[randomIndex], randomImages[ImageIndex]];

    return randomImages;
}

function loadImages() {
    // Shuffle the correct image's position
    const updatedImages = moveCorrectImage(randomImages);

    // Get all image elements in the modal
    const imageElements = document.querySelectorAll('.image-container img');
    const optionLabels = document.querySelectorAll('.captcha-options input');

    // Load the images and update radio button values
    imageElements.forEach((imgElement, index) => {
        imgElement.src = updatedImages[index].src;
        imgElement.dataset.correct = updatedImages[index].correct; // Store whether this is the correct image
    });

    // Update the radio buttons and mark the correct option
    optionLabels.forEach((input, index) => {
        input.value = index + 1;
        if (updatedImages[index].correct) {
            input.dataset.correct = "true"; // Mark the correct radio button
        } else {
            input.removeAttribute('data-correct');
        }
    });
}

loadImages();



const evaluateUserBehavior = () => {
    const timeSpent = Date.now() - startTime;
    if (!mouseMoved) userScore -= 20;
    // Deduct score if there's no keyboard usage
    if (!keyPressed) userScore -= 20;
    // Deduct score if time spent is too short
    if (timeSpent < 3000) userScore -= 30;
    // Trigger CAPTCHA if score is below threshold
    if (userScore < 50) {
        showCaptchaModal();
    }
};

/* IP Change Function */
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
                IpChangeCount: ipChangeCount + 1
            });
            
            if (ipChangeCount > 1)
                lockAccount();
            logoutUser();
        }
    }
}

/* Lock Account and Send Password Reset Email Function */
async function lockAccount() {
    const user = auth.currentUser;
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        await userRef.update({
            accountLock: true,
        });
    }
}

/* Reset Password Function */
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

/* Unlock Account Function */
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

/* ----------------------------------------------------------------------------- LISTENER -------------------------------------------------------------------------- */

let userScore = 100;
let mouseMoved = false;
let keyPressed = false;
const startTime = Date.now();

document.addEventListener('mousemove', () => { mouseMoved = true; });
document.addEventListener('keypress', () => { keyPressed = true; });

/* Idle Timer Variables */
let idleTime = 0; // Time in minutes
const maxIdleTime = 5; // Maximum idle time allowed (in minutes)

function resetIdleTimer() {
    idleTime = 0; // Reset the idle timer whenever activity is detected
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
            showCaptchaModal();
        });
    }

    /* Logged In Stuff */
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

    /* Log Out Stuff */
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }

    /* Password Reset Stuff */
    const resetPasswordButton = document.getElementById('resetPasswordButton');
    if (resetPasswordButton) {
        resetPasswordButton.addEventListener('click', resetPassword);
    }

    /* Unlock Account Button */
    const unlockAccountButton = document.getElementById('unlockAccountButton');
    if (unlockAccountButton) {
        unlockAccountButton.addEventListener('click', unlockAccount);
    }
});
