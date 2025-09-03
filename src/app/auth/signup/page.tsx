import SignupForm from '@/components/auth/SignupForm';
import AuthGuard from '@/components/auth/AuthGuard';

export default function SignupPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <SignupForm />
      </div>
    </AuthGuard>
  );
}