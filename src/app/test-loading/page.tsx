"use client"
import LoadingLink from '@/components/ui/LoadingLink';
import { useLoadingRouter } from '@/hooks/useLoadingRouter';

export default function TestLoadingPage() {
  const router = useLoadingRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Loading Spinner Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Using LoadingLink Component:</h2>
        <div className="space-x-4">
          <LoadingLink 
            href="/auth/login" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
          >
            Go to Login
          </LoadingLink>
          
          <LoadingLink 
            href="/auth/signup" 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
          >
            Go to Signup
          </LoadingLink>
          
          <LoadingLink 
            href="/dashboard" 
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block"
          >
            Go to Dashboard
          </LoadingLink>
        </div>

        <h2 className="text-xl font-semibold mt-8">Using useLoadingRouter Hook:</h2>
        <div className="space-x-4">
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
          >
            Router Push to Login
          </button>
          
          <button 
            onClick={() => router.push('/auth/signup')}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Router Push to Signup
          </button>
          
          <button 
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Click any link or button above to see the cyan loading spinner</li>
            <li>The spinner shows automatically during page navigation</li>
            <li>It disappears once the new page has loaded</li>
            <li>Auth pages now load much faster without server-side session checks</li>
          </ul>
        </div>
      </div>
    </div>
  );
}