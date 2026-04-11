// app/api/test-investment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST API: Received request');
    
    const body = await request.json();
    console.log('🧪 TEST API: Body received:', JSON.stringify(body, null, 2));
    
    // Try to connect to database
    console.log('🧪 TEST API: Connecting to database...');
    try {
      await dbConnect();
      console.log('🧪 TEST API: Database connected');
    } catch (dbError: any) {
      console.error('🧪 TEST API: Database connection failed:', dbError.message);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        message: dbError.message
      }, { status: 500 });
    }
    
    // Return success without saving
    return NextResponse.json({
      success: true,
      message: 'Test API is working!',
      receivedData: body,
      note: 'This is a test endpoint - data was not saved'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('🧪 TEST API: Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test API failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}