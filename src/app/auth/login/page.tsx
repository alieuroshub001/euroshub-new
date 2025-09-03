import LoginForm from '@/components/auth/Login';
import AuthGuard from '@/components/auth/AuthGuard';

export default function LoginPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <LoginForm />
      </div>
    </AuthGuard>
  );
}