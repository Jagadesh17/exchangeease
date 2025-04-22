import { supabase } from "@/integrations/supabase/client";

// Validates and prepares a bucket for use
export async function validateBucket(bucketName: string) {
  try {
    console.log(`Checking bucket '${bucketName}'...`);
    
    // Try to list files in the bucket to verify access
    const { error: accessError } = await supabase.storage.from(bucketName).list();
    if (accessError) {
      console.error("Error accessing bucket:", accessError);
      throw new Error(`Error accessing bucket: ${accessError.message}`);
    }
    
    console.log(`Bucket '${bucketName}' is accessible`);
  } catch (error) {
    console.error('Error in validateBucket:', error);
    throw error;
  }
}

// Uploads a book cover and returns the public URL
export async function uploadBookCover(
  file: File,
  userId: string
): Promise<string> {
  try {
    console.log(`Starting book cover upload...`);
    const bucket = 'covers';
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit for book covers
      throw new Error('File size exceeds 5MB limit');
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    // Verify bucket access
    await validateBucket(bucket);
    
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    console.log(`Uploading book cover '${fileName}'...`);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type
      });
    
    if (uploadError) {
      console.error("Error uploading book cover:", uploadError);
      throw new Error(`Error uploading book cover: ${uploadError.message}`);
    }
    
    console.log(`Book cover uploaded successfully, getting public URL...`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    
    if (!data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded book cover');
    }
    
    console.log(`Book cover upload complete. Public URL:`, data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadBookCover:', error);
    throw error;
  }
}

// Uploads a profile picture and returns the public URL
export async function uploadProfilePicture(
  file: File,
  userId: string
): Promise<string> {
  try {
    console.log(`Starting profile picture upload...`);
    const bucket = 'avatars';
    
    // Validate file size
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for avatars
      throw new Error('File size exceeds 2MB limit');
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    // Verify bucket access
    await validateBucket(bucket);
    
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    console.log(`Uploading profile picture '${fileName}'...`);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type
      });
    
    if (uploadError) {
      console.error("Error uploading profile picture:", uploadError);
      throw new Error(`Error uploading profile picture: ${uploadError.message}`);
    }
    
    console.log(`Profile picture uploaded successfully, getting public URL...`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    
    if (!data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded profile picture');
    }
    
    console.log(`Profile picture upload complete. Public URL:`, data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadProfilePicture:', error);
    throw error;
  }
}

// Deletes a file from the specified bucket
export async function deleteFile(bucket: string, filePath: string): Promise<void> {
  try {
    console.log(`Deleting file '${filePath}' from bucket '${bucket}'...`);
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    
    if (error) {
      console.error("Error deleting file:", error);
      throw new Error(`Error deleting file: ${error.message}`);
    }
    
    console.log(`File deleted successfully`);
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
}
