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
      return NextResponse.json(
        { error: 'You must be signed in to upload files.' },
        { status: 401 }
      );
    }
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please select a file to upload.' },
        { status: 400 }
      );
    }
    // File size check (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File is too large. Please upload a file smaller than 50MB.' },
        { status: 413 }
      );
    }
    // File type check
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a CSV or Excel file.' },
        { status: 415 }
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
      let msg = storageError.message || 'Unknown storage error.';
      if (msg.includes('The resource already exists')) {
        msg = 'A file with this name already exists. Please rename your file and try again.';
      }
      return NextResponse.json(
        { error: `Storage error: ${msg}` },
        { status: 500 }
      );
    }
    // Get the file URL
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('workflow-files')
      .createSignedUrl(uniqueFileName, 3600); // 1 hour expiry
    if (urlError) {
      return NextResponse.json(
        { error: 'Failed to generate file URL.' },
        { status: 500 }
      );
    }
    // Insert file record into the database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        path: uniqueFileName,
        mime_type: file.type || 'application/octet-stream',
        size: file.size,
        created_by: session.user.id,
        metadata: {
          contentType: file.type,
          lastModified: file.lastModified
        }
      })
      .select()
      .single();
    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to save file information to the database.' },
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
      { error: error instanceof Error ? error.message : 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
} 