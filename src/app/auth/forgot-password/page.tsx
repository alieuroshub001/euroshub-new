import ForgotPasswordForm from '@/components/auth/ForgotPassword';
import AuthGuard from '@/components/auth/AuthGuard';

export default function ForgotPasswordPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <ForgotPasswordForm />
      </div>
    </AuthGuard>
  );
}