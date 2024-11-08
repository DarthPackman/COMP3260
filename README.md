# Behavioral-Based Authentication and Anomaly Detection System

This project implements a comprehensive security system for web applications, focusing on behavioral-based authentication and anomaly detection. It leverages Firebase for user authentication and real-time database management, alongside custom security measures based on user behavior.

## Features

### User Authentication
- **Sign Up**: Users can create a new account using their email and password. The system initializes security metrics for tracking.
- **Log In**: Users are authenticated with their email and password. Security measures such as CAPTCHA validation and IP monitoring are employed.
- **Log Out**: Users can securely log out, and session data is cleared.

### Security Measures
- **Behavioral Analysis**:
  - **User Score**: An advanced system evaluates user behavior in real-time, considering various factors such as:
    - **Mouse Movement**: Tracks speed and movement patterns. Excessively fast or irregular mouse movements decrease the user score.
    - **Keyboard Usage**: Monitors typing intervals to detect suspicious activity. Unusual patterns or a lack of keystrokes lower the score.
    - **Mouse Clicks**: Evaluates the number of unique click positions and adjusts the score based on frequency and variety.
    - **Time Spent**: Ensures that the user spends an appropriate amount of time on the page. Too little or too much time affects the score.
    - **Page Scrolling**: Analyzes scroll depth and intervals. Erratic scrolling patterns can lower the score.
    - **Window Focus Changes**: Detects if the user frequently switches focus from the page, impacting the score.
  - If the score drops below a certain threshold (e.g., 60), a CAPTCHA is triggered.
- **CAPTCHA Validation**: A CAPTCHA modal is displayed if suspicious activity is detected. Users must select the correct image to proceed.
- **IP Monitoring**: Logs the user's IP address and detects changes between sessions. If the IP address changes too frequently, the account is locked.
- **Account Locking**: Accounts are locked if security triggers exceed thresholds, requiring a password reset for unlocking.

### Idle Time Management
- **Idle Timer**: Monitors user activity and logs out users after a period of inactivity to prevent unauthorized access.

## Firebase Configuration
The project uses Firebase for authentication and database management. Ensure you have Firebase set up with the following details:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

## File Structure
- **`index.html`**: The main login page.
- **`signUp.html`**: The sign-up page for new users.
- **`loggedIn.html`**: The page shown after a successful login.
- **`styles.css`**: Stylesheet for the web pages.
- **`script.js`**: Main JavaScript file containing all the logic for authentication, behavior analysis, and security measures.

## Usage Instructions

### Setup
1. Clone the repository.
2. Install and configure Firebase in your project.
3. Replace the Firebase configuration object in `script.js` with your Firebase project details.

### Running the Project
1. **Activate the Local Server**:
   - Open your terminal.
   - Navigate to the project directory.
   - Start a simple HTTP server to serve the files. You can use Python's built-in server:
     - For Python 3: `python -m http.server 8000`
     - For Python 2: `python -m SimpleHTTPServer 8000`
   - Your site will be accessible at `http://localhost:8000`.

### User Flow
1. **Sign Up**: Create a new account. The system tracks and stores the user's email, IP address, and security metrics.
2. **Log In**: Enter your credentials. If any security triggers are activated, you may be required to complete a CAPTCHA.
3. **CAPTCHA Modal**: If shown, select the correct image to verify that you are human.
4. **Inactivity Management**: Stay active to avoid automatic logout.

## Detailed Functionality

### Behavioral Analysis
- **User Score Evaluation**: 
  - **Mouse Movement**: Evaluates the speed and direction of movements, lowering the score if movements are erratic or too fast.
  - **Keyboard Usage**: Analyzes typing speed and intervals between key presses. Normal typing patterns increase the score, while irregularities lower it.
  - **Mouse Clicks**: Adjusts the score based on the variety and frequency of clicks.
  - **Time Spent**: Checks if the user spends a reasonable amount of time on the page.
  - **Page Scrolling**: Assesses scroll depth and the regularity of scroll actions.
  - **Window Focus**: Penalizes the score if the user frequently changes window focus.
- **CAPTCHA**: Triggered if the user score drops too low. Users must complete an image-based CAPTCHA to continue.

### Account Locking
- **CAPTCHA Trigger Count**: If a user fails the CAPTCHA 3 times, their account is locked.
- **IP Change Count**: If a user's IP address changes 3 times, the account is also locked.

## Security Functions
- **Password Reset**: Users can reset their password if they forget it or if their account is locked.
- **Account Unlock**: Users can unlock their account by resetting their password and signing in again.

## Testing the Security Features

### Behavioral Analysis
1. **Simulate Suspicious Behavior**: 
   - Test the mouse movement, keyboard usage, and other behaviors to see how the user score adjusts.
   - Ensure that the CAPTCHA modal appears when the score drops below the set threshold.

### IP Monitoring
1. **Test IP Changes**: Use a VPN or manually change your IP address and attempt to log in multiple times. Verify that the account locks after 3 IP changes.
2. **IP Change Logging**: Check the Firebase database to ensure the IP change count is incremented properly and reset after locking.

### Account Locking
1. **Account Lock Test**: Perform actions that trigger the account lock (failing CAPTCHA or changing IP frequently). Ensure the account is locked and prompts the user to reset the password.
2. **Unlock Account**: Test the password reset and account unlock functionality to make sure the account can be accessed again after resetting the password.

### Idle Time Management
1. **Idle Logout**: Stay inactive on the `loggedIn.html` page and verify that the user is logged out after the idle time threshold is reached.

## Future Enhancements
- Implement more advanced anomaly detection using machine learning.
- Add support for multi-factor authentication.
- Improve the CAPTCHA system for better security.

## Authors
- **Gavin Edwards**
- **Hritwik Saini**

### Acknowledgements
- This project used **ChatGPT** for HTML generation, formatting the README, and as a Firebase function directory.
- It also used **Dall-E 3** for image generation.
