// app/api/test/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Investment from '@/models/Investment';

export async function GET() {
  try {
    await dbConnect();
    console.log('✅ Database connected');
    
    // Try to count investments
    const count = await Investment.countDocuments();
    console.log('✅ Investment count:', count);
    
    return NextResponse.json({
      success: true,
      message: 'API is working',
      database: 'Connected',
      investmentCount: count
    });
  } catch (error: any) {
    console.error('❌ Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}