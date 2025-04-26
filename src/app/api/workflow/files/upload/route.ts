import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${file.name}`;
    
    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('workflow-files')
      .upload(uniqueFileName, file);

    if (storageError) {
      console.error('Error uploading to storage:', storageError);
      throw storageError;
    }

    // Get the file URL
    const { data: urlData } = await supabase
      .storage
      .from('workflow-files')
      .createSignedUrl(uniqueFileName, 3600); // 1 hour expiry

    // Return file information
    const fileInfo = {
      id: uniqueFileName,
      name: file.name,
      type: file.name.split('.').pop() || '',
      size: file.size,
      url: urlData?.signedUrl,
      created_at: new Date().toISOString()
    };
    
    return NextResponse.json(fileInfo);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 