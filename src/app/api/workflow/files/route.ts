import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/lib/services/fileService';

export async function GET(req: NextRequest) {
  try {
    const fileService = new FileService();
    const files = await fileService.listFiles();
    
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
} 