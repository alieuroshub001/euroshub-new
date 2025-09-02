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

interface StorageData {
  database: {
    name: string;
    collections: number;
    objects: number;
    dataSize: number;
    storageSize: number;
    indexSize: number;
    totalSize: number;
    avgObjSize: number;
  };
  collections: CollectionStat[];
  mongodb: {
    version: string;
    connectionState: number;
    host: string;
    port: number;
  };
}

export default function StorageMonitor() {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
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

  const { database, collections, mongodb } = storageData;
  const connectionStatus = getConnectionStatus(mongodb.connectionState);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircleStackIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">MongoDB Storage Monitor</h2>
              <p className="text-gray-600">Database: {database.name}</p>
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
            <div className="text-sm text-gray-600">Collections</div>
            <div className="font-medium">{database.collections}</div>
          </div>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <ChartBarIcon className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Storage Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600">Data Size</div>
            <div className="text-xl font-bold text-blue-900">{formatBytes(database.dataSize)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600">Storage Size</div>
            <div className="text-xl font-bold text-green-900">{formatBytes(database.storageSize)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600">Index Size</div>
            <div className="text-xl font-bold text-purple-900">{formatBytes(database.indexSize)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-orange-600">Total Documents</div>
            <div className="text-xl font-bold text-orange-900">{database.objects.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Storage Breakdown</div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full flex items-center justify-center text-xs text-white"
              style={{ width: database.totalSize > 0 ? '100%' : '10%' }}
            >
              {formatBytes(database.totalSize)}
            </div>
          </div>
        </div>
      </div>

      {/* Collections Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Collections Detail</h3>
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
              {collections.map((collection, index) => (
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
    </div>
  );
}