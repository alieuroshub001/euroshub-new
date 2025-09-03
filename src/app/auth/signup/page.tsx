import AuthGuard from '@/components/auth/AuthGuard';

export default function SignupPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
          <p>Signup form would go here. This is a placeholder to test the loading spinner.</p>
        </div>
      </div>
    </AuthGuard>
  );
}