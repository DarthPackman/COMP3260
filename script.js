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

let mouseMoved = false;
let mousePath = [];
let keyPressed = false;
let mouseClicked = false;
let uniqueKeysPressed = new Set();
let clickPositions = new Set();
let pageScrolled = false;
let captchaTrigger = false;
let scrollDepth = 0;
let startTime = Date.now();
let userScore = 100; 
let keyPressIntervals = [];
let lastKeyPressTime = 0;
let scrollIntervals = [];
let lastScrollTime = 0;
let windowFocusChanges = 0;
let idleTime = 0;
const maxIdleTime = 5;

/* ----------------------------------------------------------------------------- UTILITY FUNCTIONS --------------------------------------------------------------------- */

//IP address fetch function
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

//Idle timer functions
function resetIdleTimer() {
    idleTime = 0;
}

//Behavior evaluation function
function evaluateUserBehavior() {
    // Your behavior evaluation logic here
    console.log("Evaluating user behavior...");
}

// Start calling evaluateUserBehavior every 1000ms
setInterval(evaluateUserBehavior, 500);

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

// evaluateUserBehavior function
function evaluateUserBehavior() {
    const timeSpent = Date.now() - startTime;
    userScore = 97;
    
    //Evaluate mouse movement
    if (mouseMoved) {
        userScore += 10;
        if (mousePath.length > 10) {
            userScore += 5; 
        }

        const speedThreshold = 1.5 / window.devicePixelRatio;
        let highSpeedCount = 0;
        for (let i = 1; i < mousePath.length; i++) {
            if (mousePath[i].speed && mousePath[i].speed > speedThreshold) {
                highSpeedCount++;
            }
        }

        if (highSpeedCount > mousePath.length * 0.15) { 
            userScore -= 20;
        }
    } else {
        userScore -= 20; 
    }

    //Evaluate key press
    if (keyPressIntervals.length > 0) {
        const averageKeyPressInterval = keyPressIntervals.reduce((a, b) => a + b) / keyPressIntervals.length;
        if (averageKeyPressInterval > 150 && averageKeyPressInterval < 800) { 
            userScore += 5; 
        } else {
            userScore -= 20; 
        }
    } else {
        userScore -= 15; 
    }

    //Evaluate mouse click
    if (mouseClicked) {
        userScore += 10; 
        if (clickPositions.size > 3) {
            userScore += 5; 
        } else {
            userScore -= 10; 
        }
    } else {
        userScore -= 20; 
    }

    //Evaluate time spent
    if (timeSpent >= 3000 && timeSpent <= 15000) { 
        userScore += 10; 
    } else if (timeSpent < 3000) {
        userScore -= 20; 
    } else {
        userScore -= 15; 
    }

    //Evaluate page scroll
    if (pageScrolled) {
        userScore += 10; 
        if (scrollDepth > 50) {
            userScore += 5; 
        }
        if (scrollIntervals.length > 0) {
            const averageScrollInterval = scrollIntervals.reduce((a, b) => a + b) / scrollIntervals.length;
            if (averageScrollInterval > 700) { 
                userScore += 5; 
                userScore -= 10; 
            }
        }
    } else {
        userScore -= 15; 
    }

    //Evaluate window focus changes
    if (windowFocusChanges > 0) {
        userScore += 3; 
    } else {
        userScore -= 10; 
    }
    
    //Evaluate behavior
    if (userScore <= 60) { 
        captchaTrigger = true;
    }else{
        captchaTrigger = false;
    }
    console.log('User score:', userScore);
}


// showCaptchaModal function
function showCaptchaModal() {
    document.getElementById("captchaModal").style.display = "flex";
}

// closeCaptchaModal function
function closeCaptchaModal() {
    document.getElementById("captchaModal").style.display = "none";
}

// validateCaptchaSelection function
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

// IP Address Changed Logout function
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

// Lock Account function
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

// Reset Password function
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

// Unlock Account function
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

// Captcha images
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

// moveCorrectImage function
function moveCorrectImage(images) {
    const ImageIndex = 0;
    const randomIdx = Math.floor(Math.random() * images.length);
    [images[ImageIndex], images[randomIdx]] = [images[randomIdx], images[ImageIndex]];
    return images;
}

// loadImages function
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
window.addEventListener('focus', () => { windowFocusChanges += 1; });
window.addEventListener('blur', () => { windowFocusChanges += 1; });
document.addEventListener('mousemove', (event) => {
    mouseMoved = true;

    const currentTime = Date.now();
    const currentPosition = { x: event.clientX, y: event.clientY, time: currentTime };

    if (mousePath.length > 0) {
        const lastPosition = mousePath[mousePath.length - 1];
        const distance = Math.sqrt(Math.pow(currentPosition.x - lastPosition.x, 2) + Math.pow(currentPosition.y - lastPosition.y, 2));
        const timeDiff = currentTime - lastPosition.time;

        if (timeDiff > 0) {
            const normalizedDistance = distance / window.devicePixelRatio; 
            currentPosition.speed = normalizedDistance / timeDiff;
        }
    }

    mousePath.push(currentPosition);
});
document.addEventListener('keypress', (event) => {
    keyPressed = true;
    uniqueKeysPressed.add(event.key);
    const currentTime = Date.now();
    if (lastKeyPressTime) {
        keyPressIntervals.push(currentTime - lastKeyPressTime);
    }
    lastKeyPressTime = currentTime;
});
document.addEventListener('scroll', () => {
    pageScrolled = true;
    const currentScrollDepth = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    scrollDepth = Math.max(scrollDepth, currentScrollDepth);

    const currentTime = Date.now();
    if (lastScrollTime) {
        scrollIntervals.push(currentTime - lastScrollTime);
    }
    lastScrollTime = currentTime;
});
document.addEventListener('click', () => { mouseClicked = true; });

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
