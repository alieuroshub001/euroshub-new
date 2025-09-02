"use client"
import { useState, useEffect } from 'react';
import { 
  ServerIcon, 
  CircleStackIcon, 
  ArrowPathIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface CollectionStat {
  name: string;
  documents: number;
  size: number;
  storageSize: number;
  indexes: number;
  indexSize: number;
}

interface DatabaseInfo {
  name: string;
  sizeOnDisk: number;
  collections: number;
  objects: number;
  dataSize: number;
  storageSize: number;
  indexSize: number;
  totalSize: number;
  avgObjSize: number;
  collectionsDetail: CollectionStat[];
  isCurrentDatabase: boolean;
  error?: string;
}

interface ClusterUsage {
  totalSizeOnDisk: number;
  totalDataSize: number;
  clusterLimit: number;
  availableSpace: number;
  usedPercentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  cacheSize?: number;
  cacheUsed?: number;
}

interface StorageData {
  instance: {
    totalDatabases: number;
    totalSize: number;
    totalSizeOnDisk: number;
    totalObjects: number;
    currentDatabase: string;
    clusterUsage: ClusterUsage;
  };
  databases: DatabaseInfo[];
  mongodb: {
    version: string;
    connectionState: number;
    host: string;
    port: number;
    storageEngine: string;
  };
}

export default function StorageMonitor() {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStorageData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/admin/storage');
      const data = await response.json();

      if (data.success) {
        setStorageData(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching storage data:', error);
      setError('Failed to fetch storage information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatus = (state: number) => {
    const states = {
      0: { text: 'Disconnected', color: 'text-red-600 bg-red-100' },
      1: { text: 'Connected', color: 'text-green-600 bg-green-100' },
      2: { text: 'Connecting', color: 'text-yellow-600 bg-yellow-100' },
      3: { text: 'Disconnecting', color: 'text-orange-600 bg-orange-100' }
    };
    return states[state as keyof typeof states] || { text: 'Unknown', color: 'text-gray-600 bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading storage information...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-2">Error loading storage data</div>
            <div className="text-gray-500 text-sm mb-4">{error}</div>
            <button
              onClick={() => fetchStorageData()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!storageData) return null;

  const { instance, databases, mongodb } = storageData;
  const connectionStatus = getConnectionStatus(mongodb.connectionState);
  const selectedDb = selectedDatabase 
    ? databases.find(db => db.name === selectedDatabase)
    : databases.find(db => db.isCurrentDatabase) || databases[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircleStackIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">MongoDB Instance Monitor</h2>
              <p className="text-gray-600">
                {instance.totalDatabases} databases • Current: {instance.currentDatabase}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchStorageData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Instance Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <ChartBarIcon className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Instance Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-600">Total Databases</div>
            <div className="text-2xl font-bold text-blue-900">{instance.totalDatabases}</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-sm text-green-600">Atlas Usage</div>
            <div className="text-2xl font-bold text-green-900">{formatBytes(instance.clusterUsage.totalDataSize)}</div>
            <div className="text-xs text-green-600 mt-1">
              Matches Atlas dashboard
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="text-sm text-orange-600">Disk Usage</div>
            <div className="text-2xl font-bold text-orange-900">{formatBytes(instance.totalSizeOnDisk)}</div>
            <div className="text-xs text-orange-600 mt-1">
              Physical storage
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-sm text-purple-600">Total Documents</div>
            <div className="text-2xl font-bold text-purple-900">{instance.totalObjects.toLocaleString()}</div>
          </div>
        </div>

        {/* Cluster Storage Quota */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">MongoDB Cluster Storage Quota</h4>
            <div className="text-sm text-gray-600">
              {formatBytes(instance.clusterUsage.clusterLimit)} total
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Main Storage Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-4 rounded-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300 ${
                  instance.clusterUsage.isAtLimit 
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : instance.clusterUsage.isNearLimit
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-blue-500 to-green-500'
                }`}
                style={{ 
                  width: `${Math.min(Math.max(instance.clusterUsage.usedPercentage, 2), 100)}%`
                }}
              >
                {instance.clusterUsage.usedPercentage.toFixed(1)}%
              </div>
            </div>
            
            {/* Usage Statistics */}
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="font-medium text-gray-900">{formatBytes(instance.clusterUsage.totalDataSize)}</div>
                <div className="text-gray-500">Used</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">{formatBytes(instance.clusterUsage.availableSpace)}</div>
                <div className="text-gray-500">Available</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">{formatBytes(instance.clusterUsage.clusterLimit)}</div>
                <div className="text-gray-500">Total Quota</div>
              </div>
            </div>

            {/* Warning Messages */}
            {instance.clusterUsage.isAtLimit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-red-800 text-sm font-medium">Storage Limit Reached!</span>
                </div>
                <p className="text-red-700 text-xs mt-1">
                  You're at 95%+ of your cluster storage limit. Consider upgrading your plan or cleaning up data.
                </p>
              </div>
            )}

            {instance.clusterUsage.isNearLimit && !instance.clusterUsage.isAtLimit && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-yellow-800 text-sm font-medium">Storage Warning</span>
                </div>
                <p className="text-yellow-700 text-xs mt-1">
                  You're using over 80% of your cluster storage limit. Monitor usage closely.
                </p>
              </div>
            )}

            {/* Cluster Tier Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-blue-800 text-sm font-medium mb-1">
                {instance.clusterUsage.clusterLimit === 512 * 1024 * 1024 ? 'Free Tier (M0)' : 'Paid Cluster'}
              </div>
              <p className="text-blue-700 text-xs">
                {instance.clusterUsage.clusterLimit === 512 * 1024 * 1024 
                  ? 'Free MongoDB Atlas cluster with 512MB storage limit'
                  : `Custom cluster with ${formatBytes(instance.clusterUsage.clusterLimit)} storage limit`
                }
              </p>
            </div>
          </div>

          {/* Cache Information if available */}
          {instance.clusterUsage.cacheSize && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-700">WiredTiger Cache</span>
                <span className="text-xs text-gray-600">
                  {formatBytes(instance.clusterUsage.cacheUsed || 0)} / {formatBytes(instance.clusterUsage.cacheSize)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: instance.clusterUsage.cacheUsed && instance.clusterUsage.cacheSize 
                      ? `${Math.min((instance.clusterUsage.cacheUsed / instance.clusterUsage.cacheSize) * 100, 100)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Database Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Databases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {databases.map((db) => (
            <div
              key={db.name}
              onClick={() => setSelectedDatabase(db.name)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                selectedDb?.name === db.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{db.name}</h4>
                {db.isCurrentDatabase && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Size: {formatBytes(db.totalSize)}</div>
                <div>Collections: {db.collections}</div>
                <div>Documents: {db.objects.toLocaleString()}</div>
              </div>
              {db.error && (
                <div className="mt-2 text-xs text-red-600">
                  {db.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <ServerIcon className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Status</div>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${connectionStatus.color}`}>
              {connectionStatus.text}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Host</div>
            <div className="font-medium">{mongodb.host}:{mongodb.port}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">MongoDB Version</div>
            <div className="font-medium">v{mongodb.version}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Storage Engine</div>
            <div className="font-medium">{mongodb.storageEngine}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Collections</div>
            <div className="font-medium">{databases.reduce((total, db) => total + db.collections, 0)}</div>
          </div>
        </div>
      </div>

      {/* Selected Database Details */}
      {selectedDb && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <ChartBarIcon className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Database: {selectedDb.name}
                {selectedDb.isCurrentDatabase && (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Current
                  </span>
                )}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600">Data Size</div>
                <div className="text-xl font-bold text-blue-900">{formatBytes(selectedDb.dataSize)}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600">Storage Size</div>
                <div className="text-xl font-bold text-green-900">{formatBytes(selectedDb.storageSize)}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600">Index Size</div>
                <div className="text-xl font-bold text-purple-900">{formatBytes(selectedDb.indexSize)}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-orange-600">Documents</div>
                <div className="text-xl font-bold text-orange-900">{selectedDb.objects.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Database Size: {formatBytes(selectedDb.totalSize)}</div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full flex items-center justify-center text-xs text-white"
                  style={{ 
                    width: instance.totalSize > 0 ? `${(selectedDb.totalSize / instance.totalSize) * 100}%` : '10%',
                    minWidth: '10%' 
                  }}
                >
                  {((selectedDb.totalSize / instance.totalSize) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedDb.totalSize > 0 ? `${((selectedDb.totalSize / instance.totalSize) * 100).toFixed(2)}% of total instance` : 'No data'}
              </div>
            </div>
          </div>

          {/* Collections Details */}
          {selectedDb.collectionsDetail.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Collections in {selectedDb.name}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Collection</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Documents</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Data Size</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Storage Size</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Indexes</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Index Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDb.collectionsDetail.map((collection, index) => (
                      <tr key={collection.name} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-3 px-4 font-medium">{collection.name}</td>
                        <td className="py-3 px-4">{collection.documents.toLocaleString()}</td>
                        <td className="py-3 px-4">{formatBytes(collection.size)}</td>
                        <td className="py-3 px-4">{formatBytes(collection.storageSize)}</td>
                        <td className="py-3 px-4">{collection.indexes}</td>
                        <td className="py-3 px-4">{formatBytes(collection.indexSize)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedDb.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-800 font-medium">Error accessing database</h4>
              <p className="text-red-700 text-sm mt-1">{selectedDb.error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}