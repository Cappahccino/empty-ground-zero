import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/lib/services/fileService';

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    const fileService = new FileService();
    const sheets = await fileService.getSheetNames(fileId);
    
    return NextResponse.json(sheets);
  } catch (error) {
    console.error('Error getting sheet names:', error);
    return NextResponse.json(
      { error: 'Failed to get sheet names' },
      { status: 500 }
    );
  }
} 