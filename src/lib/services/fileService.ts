import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
}

export class FileService {
  private bucket = 'workflow-files';

  /**
   * List all files in the storage bucket
   */
  async listFiles(): Promise<FileInfo[]> {
    const { data, error } = await supabase
      .storage
      .from(this.bucket)
      .list();

    if (error) {
      console.error('Error fetching files:', error);
      throw error;
    }

    // Convert to FileInfo format
    return data.filter(item => !item.id.endsWith('/')).map(item => ({
      id: item.id,
      name: item.name,
      type: item.name.split('.').pop() || '',
      size: item.metadata?.size || 0,
      created_at: item.created_at || new Date().toISOString(),
    }));
  }

  /**
   * Upload a file to the storage bucket
   */
  async uploadFile(file: File, filePath?: string): Promise<FileInfo> {
    const path = filePath || `${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase
      .storage
      .from(this.bucket)
      .upload(path, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    return {
      id: data.path,
      name: file.name,
      type: file.name.split('.').pop() || '',
      size: file.size,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Get a signed URL for a file
   */
  async getFileUrl(fileId: string): Promise<string> {
    const { data, error } = await supabase
      .storage
      .from(this.bucket)
      .createSignedUrl(fileId, 60 * 60); // 1 hour expiry

    if (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }

    return data.signedUrl;
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(fileId: string): Promise<void> {
    const { error } = await supabase
      .storage
      .from(this.bucket)
      .remove([fileId]);

    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get sheet names from an Excel file
   * This would be implemented with a server-side API
   * that uses a library like exceljs or xlsx
   */
  async getSheetNames(fileId: string): Promise<string[]> {
    // In a real implementation, this would call a server-side API
    // that reads the Excel file and returns the sheet names
    
    // Mock implementation for development
    const mockSheets: Record<string, string[]> = {
      'sales_data.xlsx': ['Sales 2023', 'Sales 2022', 'Products'],
      'inventory.xlsx': ['Inventory', 'Orders', 'Suppliers'],
    };
    
    // Extract filename from fileId
    const fileName = fileId.split('/').pop() || '';
    
    return mockSheets[fileName] || [];
  }
} 