
import { auth } from './config';
import { sendPasswordResetEmail as firebaseSendPasswordResetEmail, signOut as firebaseSignOut } from 'firebase/auth';

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
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
