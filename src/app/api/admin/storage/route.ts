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

    // Get the admin database to list all databases
    const adminDb = mongoose.connection.db.admin();
    const currentDb = mongoose.connection.db;
    
    // Get list of all databases (includes totalSize)
    const { databases, totalSize: totalInstanceSize } = await adminDb.listDatabases();
    
    // Get server status for additional storage information
    let serverStats = null;
    try {
      serverStats = await adminDb.serverStatus();
    } catch (error) {
      console.warn('Could not get server status:', error);
    }
    
    const allDatabases = [];
    let totalDataSize = 0;
    let totalInstanceObjects = 0;
    
    for (const dbInfo of databases) {
      try {
        // Skip system databases
        if (['admin', 'local', 'config'].includes(dbInfo.name)) {
          continue;
        }

        // Get database reference
        const db = mongoose.connection.client.db(dbInfo.name);
        
        // Get database statistics
        const stats = await db.stats();
        
        // Get collection statistics for this database
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
            console.warn(`Could not get stats for collection ${collection.name} in db ${dbInfo.name}:`, error);
          }
        }

        const databaseData = {
          name: dbInfo.name,
          sizeOnDisk: dbInfo.sizeOnDisk || 0,
          collections: stats.collections || 0,
          objects: stats.objects || 0,
          dataSize: stats.dataSize || 0,
          storageSize: stats.storageSize || 0,
          indexSize: stats.indexSize || 0,
          totalSize: (stats.dataSize || 0) + (stats.indexSize || 0),
          avgObjSize: stats.avgObjSize || 0,
          collectionsDetail: collectionStats,
          isCurrentDatabase: dbInfo.name === currentDb.databaseName
        };

        allDatabases.push(databaseData);
        totalDataSize += databaseData.totalSize;
        totalInstanceObjects += databaseData.objects;

      } catch (error) {
        console.warn(`Could not get stats for database ${dbInfo.name}:`, error);
        // Still add basic info even if we can't get detailed stats
        allDatabases.push({
          name: dbInfo.name,
          sizeOnDisk: dbInfo.sizeOnDisk || 0,
          collections: 0,
          objects: 0,
          dataSize: 0,
          storageSize: 0,
          indexSize: 0,
          totalSize: 0,
          avgObjSize: 0,
          collectionsDetail: [],
          isCurrentDatabase: dbInfo.name === currentDb.databaseName,
          error: 'Could not fetch detailed statistics'
        });
      }
    }

    // Calculate cluster storage information
    // Default to MongoDB Atlas Free Tier limit (512MB)
    const DEFAULT_CLUSTER_LIMIT = 512 * 1024 * 1024; // 512MB in bytes
    
    // You can set your cluster limit via environment variable
    const clusterStorageLimit = process.env.MONGODB_CLUSTER_STORAGE_LIMIT 
      ? parseInt(process.env.MONGODB_CLUSTER_STORAGE_LIMIT) 
      : DEFAULT_CLUSTER_LIMIT;

    // Use the sum of actual data sizes from individual database stats
    // This matches what MongoDB Atlas shows in their dashboard
    const actualClusterUsage = totalDataSize; // This is the sum of dataSize from each database
    
    const clusterUsage = {
      totalSizeOnDisk: totalInstanceSize || 0, // Physical disk usage (for reference)
      totalDataSize: actualClusterUsage, // Actual logical data size (what Atlas shows)
      clusterLimit: clusterStorageLimit,
      availableSpace: Math.max(clusterStorageLimit - actualClusterUsage, 0),
      usedPercentage: actualClusterUsage ? ((actualClusterUsage / clusterStorageLimit) * 100) : 0,
      isNearLimit: actualClusterUsage ? ((actualClusterUsage / clusterStorageLimit) * 100) > 80 : false,
      isAtLimit: actualClusterUsage ? ((actualClusterUsage / clusterStorageLimit) * 100) >= 95 : false
    };

    // Try to get cache information from server stats
    if (serverStats && serverStats.wiredTiger && serverStats.wiredTiger.cache) {
      try {
        clusterUsage.cacheSize = serverStats.wiredTiger.cache['maximum bytes configured'];
        clusterUsage.cacheUsed = serverStats.wiredTiger.cache['bytes currently in the cache'];
      } catch (error) {
        console.warn('Could not parse cache stats:', error);
      }
    }

    // Calculate storage information
    const storageInfo = {
      instance: {
        totalDatabases: allDatabases.length,
        totalSize: totalDataSize, // Actual data size (matches Atlas dashboard)
        totalSizeOnDisk: clusterUsage.totalSizeOnDisk, // Physical disk usage (for reference)
        totalObjects: totalInstanceObjects,
        currentDatabase: currentDb.databaseName,
        clusterUsage: clusterUsage
      },
      databases: allDatabases.sort((a, b) => {
        // Current database first, then by total size
        if (a.isCurrentDatabase) return -1;
        if (b.isCurrentDatabase) return 1;
        return b.totalSize - a.totalSize;
      }),
      mongodb: {
        version: mongoose.version,
        connectionState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        storageEngine: serverStats?.storageEngine?.name || 'Unknown'
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