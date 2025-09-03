import ResetPasswordForm from '@/components/auth/ResetPassword';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ 
    email?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  // Await the searchParams promise
  const params = await searchParams;
  
  if (!params.email) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResetPasswordForm email={params.email} />
    </div>
  );
}