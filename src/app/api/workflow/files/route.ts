import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    // Get files from storage
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('workflow-files')
      .list();

    if (storageError) {
      console.error('Error listing files from storage:', storageError);
      throw storageError;
    }

    // Get file metadata from the database
    const { data: dbFiles, error: dbError } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Error fetching files from database:', dbError);
      throw dbError;
    }

    // Combine storage and database information
    const files = storageFiles
      .filter(file => !file.id.endsWith('/'))
      .map(file => {
        const dbFile = dbFiles?.find(db => db.storage_path === file.name);
        return {
          id: file.name,
          name: dbFile?.name || file.name,
          type: file.name.split('.').pop() || '',
          size: file.metadata?.size || 0,
          created_at: dbFile?.created_at || file.created_at || new Date().toISOString(),
        };
      });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
} 