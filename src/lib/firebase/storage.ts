import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config'; // Import your Firebase storage instance

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be stored (e.g., 'profilePictures/userId').
 * @param fileName The name for the file in Storage.
 * @returns Promise<string> The download URL of the uploaded file.
 */
export async function uploadFileToStorage(file: File, path: string, fileName: string): Promise<string> {
  if (!file) throw new Error('No file provided for upload.');
  
  const storageRef = ref(storage, `${path}/${fileName}`);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Uploaded a blob or file!', snapshot);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase Storage: ", error);
    throw error;
  }
}

/**
 * Deletes a file from Firebase Storage.
 * @param filePath The full path to the file in Firebase Storage (e.g., 'profilePictures/userId/fileName.jpg').
 * @returns Promise<void>
 */
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  const storageRef = ref(storage, filePath);
  try {
    await deleteObject(storageRef);
    console.log('File deleted successfully from Firebase Storage');
  } catch (error) {
    console.error("Error deleting file from Firebase Storage: ", error);
    // Handle specific errors, e.g., if the file doesn't exist
    // or if the user doesn't have permission.
    throw error;
  }
}

// Example usage for a profile picture:
// async function uploadProfilePicture(userId: string, file: File) {
//   const profilePicName = `profile_${Date.now()}_${file.name}`;
//   const downloadURL = await uploadFileToStorage(file, `profilePictures/${userId}`, profilePicName);
//   // Then save this downloadURL to the user's profile in Firestore
//   console.log('Profile picture URL:', downloadURL);
//   return downloadURL;
// }
