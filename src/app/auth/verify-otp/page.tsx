import VerifyOTPForm from '@/components/auth/VerifyOTP';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ 
    email?: string;
    type?: 'verification' | 'password-reset';
    userEmail?: string;
  }>;
}

export default async function VerifyOTPPage({ searchParams }: PageProps) {
  // Await the searchParams promise
  const params = await searchParams;

  if (!params.email || !params.type) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VerifyOTPForm 
        email={params.email} 
        type={params.type}
        userEmail={params.userEmail}
      />
    </div>
  );
}