"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes } from '../ui/background-boxes';

interface VerifyOTPFormProps {
  email: string;
  type: 'verification' | 'password-reset';
  userEmail?: string;
}

export default function VerifyOTPForm({ email, type, userEmail }: VerifyOTPFormProps) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For password reset, validate passwords match
      if (type === 'password-reset' && newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          otp,
          type,
          userEmail,
          ...(type === 'password-reset' && { newPassword })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess(data.message);
      
      // Redirect to login after short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      
      {/* OTP Form */}
      <div className="max-w-md w-full space-y-8 relative z-20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {type === 'password-reset' ? (
              <>
                <span className="text-cyan-400">EurosHub</span> Password Reset
              </>
            ) : (
              <>
                <span className="text-cyan-400">EurosHub</span> Verification
              </>
            )}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Enter the OTP sent to <span className="text-indigo-400 font-medium">{email}</span>
            {userEmail && userEmail !== email && (
              <span className="block text-xs text-gray-400 mt-2 p-2 bg-slate-800/50 rounded-md border border-slate-600">
                Account: {userEmail}
              </span>
            )}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            {success}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-200 mb-2">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200 text-center text-lg font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            
            {type === 'password-reset' && (
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-200 mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 backdrop-blur-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]'}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {type === 'password-reset' ? 'Processing...' : 'Verifying...'}
                </span>
              ) : (
                type === 'password-reset' ? 'Reset Password' : 'Verify OTP'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}