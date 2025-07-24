
import { auth } from './config';
import { 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail, 
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  type User
} from 'firebase/auth';

/**
 * Sends a password reset email to the given email address.
 * @param email The user's email address.
 * @returns Promise<void>
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Signs out the current user.
 * @returns Promise<void>
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    console.log('User signed out successfully.');
     if (typeof window !== 'undefined') {
        localStorage.removeItem('isAdminLoggedIn');
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Initiates Google Sign-In process.
 * @returns Promise<User | null> The signed-in Firebase user object or null on error.
 */
export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // The signed-in user info.
    const user = result.user;
    console.log('Successfully signed in with Google:', user.displayName);
    return user;
  } catch (error) {
    console.error('Error during Google Sign-In:', error);
    // Handle specific errors (e.g., popup closed, account exists with different credential)
    throw error;
  }
}
