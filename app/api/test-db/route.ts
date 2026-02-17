// app/api/test-db/route.ts - COMPLETE WORKING VERSION
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI not found in .env.local'
      }, { status: 500 });
    }

    console.log('🧪 Testing MongoDB connection to:', MONGODB_URI.substring(0, 50) + '...');
    
    // Direct connection test
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Check if our collections exist
    const hasInvestments = collectionNames.includes('investments');
    const hasPresalestats = collectionNames.includes('presalestats');

    mongoose.connection.close();

    return NextResponse.json({
      success: true,
      message: '✅ MongoDB Atlas connection successful!',
      data: {
        database: db.databaseName,
        collections: collectionNames,
        hasInvestmentsCollection: hasInvestments,
        hasPresaleStatsCollection: hasPresalestats,
        connection: 'active'
      }
    });
    
  } catch (error: any) {
    console.error('❌ MongoDB test failed:', error);
    
    // Provide helpful error messages
    let errorMessage = error.message;
    let suggestion = '';
    
    if (error.message.includes('bad auth')) {
      suggestion = 'Check your MongoDB Atlas username/password';
    } else if (error.message.includes('ENOTFOUND')) {
      suggestion = 'Check your internet connection or MongoDB Atlas cluster URL';
    } else if (error.message.includes('timed out')) {
      suggestion = 'MongoDB Atlas cluster might be paused. Check Atlas dashboard.';
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      suggestion: suggestion || 'Check your MONGODB_URI in .env.local'
    }, { status: 500 });
  }
}