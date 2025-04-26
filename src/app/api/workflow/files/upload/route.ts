import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    // Get the session to ensure user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
    const uniqueFileName = `${session.user.id}/${timestamp}_${file.name}`;
    
    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('workflow-files')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) {
      console.error('Error uploading to storage:', storageError);
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      );
    }

    // Get the file URL
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('workflow-files')
      .createSignedUrl(uniqueFileName, 3600); // 1 hour expiry

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate file URL' },
        { status: 500 }
      );
    }

    // Insert file record into the database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        original_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size: file.size,
        storage_path: uniqueFileName,
        storage_bucket: 'workflow-files',
        created_by: session.user.id,
        metadata: {
          contentType: file.type,
          lastModified: file.lastModified
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error inserting file record:', dbError);
      return NextResponse.json(
        { error: 'Failed to save file information' },
        { status: 500 }
      );
    }

    // Return file information
    const fileInfo = {
      id: uniqueFileName,
      name: file.name,
      type: file.name.split('.').pop() || '',
      size: file.size,
      url: urlData.signedUrl,
      created_at: fileRecord.created_at
    };
    
    return NextResponse.json(fileInfo);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
} 