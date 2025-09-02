import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get database name from connection
    const db = mongoose.connection.db;
    const dbName = db.databaseName;

    // Get database statistics
    const stats = await db.stats();
    
    // Get collection statistics
    const collections = await db.listCollections().toArray();
    const collectionStats = [];

    for (const collection of collections) {
      try {
        const collectionStat = await db.collection(collection.name).stats();
        collectionStats.push({
          name: collection.name,
          documents: collectionStat.count || 0,
          size: collectionStat.size || 0,
          storageSize: collectionStat.storageSize || 0,
          indexes: collectionStat.nindexes || 0,
          indexSize: collectionStat.totalIndexSize || 0
        });
      } catch (error) {
        console.warn(`Could not get stats for collection ${collection.name}:`, error);
      }
    }

    // Calculate storage information
    const storageInfo = {
      database: {
        name: dbName,
        collections: stats.collections || 0,
        objects: stats.objects || 0,
        dataSize: stats.dataSize || 0,
        storageSize: stats.storageSize || 0,
        indexSize: stats.indexSize || 0,
        totalSize: (stats.dataSize || 0) + (stats.indexSize || 0),
        avgObjSize: stats.avgObjSize || 0
      },
      collections: collectionStats,
      mongodb: {
        version: mongoose.version,
        connectionState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    };

    return NextResponse.json({
      success: true,
      data: storageInfo
    });

  } catch (error: any) {
    console.error('Error fetching storage statistics:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}