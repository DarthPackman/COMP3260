# COMP3260: Behavioral-Based Authentication and Anomaly Detection

This project implements a behavioral-based authentication system with anomaly detection for enhanced security. The goal is to protect user accounts from brute force and automated attacks using behavioral metrics such as typing speed, mouse movement, and session interactions.

## Features
1. **User Authentication**:
   - **Sign Up**: Allows new users to register with an email and password.
   - **Log In**: Authenticates existing users and checks for security measures.
   - **Log Out**: Safely logs out users and redirects them to the homepage.

2. **Behavioral Metrics**:
   - **Typing Speed and Mouse Movement**: Measures user behavior to detect anomalies.
   - **IP Address Monitoring**: Logs and tracks IP changes to identify suspicious activity.

3. **Security Measures**:
   - **Account Locking**: Locks an account after detecting suspicious activity.
   - **CAPTCHA Verification**: Triggers a CAPTCHA test when abnormal behavior is detected.
   - **Password Reset**: Allows users to reset their passwords if the account is locked.

4. **Idle Timer**:
   - Monitors user activity and logs out after a period of inactivity.

## File Structure
- `index.html`: The main login page.
- `loggedIn.html`: The page displayed after successful login.
- `signUp.html`: The sign-up page for new users.
- `script.js`: JavaScript code for authentication, security measures, and user behavior tracking.
- `styles.css`: Stylesheet for the web pages.

## Setup Instructions
1. Clone the repository to your local machine.
2. Make sure you have Firebase configured with your project.
3. Update the `firebaseConfig` object in `script.js` with your Firebase project details.
4. Serve the project using a local server or host it on a web server.

## Firebase Configuration
- This project uses Firebase for authentication and real-time database functionality.
- Ensure your Firebase project is properly configured, and the Realtime Database rules are set up to allow read/write access for authenticated users.

## Detailed Functionality
### Authentication
- **Sign Up**: Registers a new user and stores their email, IP address, and last login timestamp.
- **Log In**: Verifies user credentials and checks for any account locks before granting access.
- **Log Out**: Logs out the user and clears the session.

### Security Measures
- **Behavioral Detection**: Uses metrics like typing speed, mouse movement, and time spent on the page to evaluate suspicious behavior.
- **CAPTCHA**: A modal CAPTCHA test is triggered if suspicious behavior is detected.
- **Account Lock**: Accounts are locked if multiple security triggers are activated, requiring a password reset to unlock.

### IP Monitoring
- Logs the user's IP address and compares it to previous sessions. If a significant change is detected, the account is flagged.

### Idle Timer
- Logs out the user after a specified period of inactivity to ensure session security.

## Usage
1. **Sign Up**: Register with a valid email and password.
2. **Log In**: Use your credentials to log in. If your behavior triggers security measures, you'll need to pass a CAPTCHA or reset your password.
3. **Idle Timer**: Stay active on the page to avoid automatic logout due to inactivity.

## Future Enhancements
- Implement additional behavioral metrics for better anomaly detection.
- Integrate multi-factor authentication (MFA) as a secondary layer of security.
- Explore using machine learning models to detect more sophisticated patterns of anomalous behavior.

## Authors
- **Gavin Edwards**: Responsible for frontend development, JS implementation for behavioral detection, and Firebase integration.
- **Hritwik Saini**: Focused on database management, account locking mechanisms, and CAPTCHA system implementation.

## License
This project is licensed under the MIT License. See `LICENSE` for more details.

## Contact
For any questions or issues, please reach out to [Your Email] or create an issue on the repository.

---

Let me know if you need any edits or additional sections in your README file!
