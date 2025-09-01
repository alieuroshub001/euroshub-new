'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VerifyOtpProps {
  email: string;
  role: 'hr' | 'employee' | 'client';
  onBack: () => void;
}

const roleColors = {
  hr: {
    primary: 'blue',
    gradient: 'from-blue-50 to-cyan-100',
    button: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
    focus: 'focus:ring-blue-500',
    text: 'text-blue-600 hover:text-blue-700 disabled:text-blue-400'
  },
  employee: {
    primary: 'green',
    gradient: 'from-green-50 to-emerald-100',
    button: 'bg-green-600 hover:bg-green-700 disabled:bg-green-400',
    focus: 'focus:ring-green-500',
    text: 'text-green-600 hover:text-green-700 disabled:text-green-400'
  },
  client: {
    primary: 'purple',
    gradient: 'from-purple-50 to-indigo-100',
    button: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400',
    focus: 'focus:ring-purple-500',
    text: 'text-purple-600 hover:text-purple-700 disabled:text-purple-400'
  }
};

export default function VerifyOtp({ email, role, onBack }: VerifyOtpProps) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const colors = roleColors[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${colors.gradient}`}>
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              Registration Complete!
            </h1>
            <p className="text-gray-600 mb-6">
              Your {role} registration has been submitted successfully. You will receive an email notification once an admin approves your account.
            </p>
            <Link
              href="/login"
              className={`inline-block ${colors.button} text-white font-medium py-2 px-6 rounded-lg transition-colors`}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${colors.gradient}`}>
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a verification code to <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${colors.focus} focus:border-transparent transition-colors text-center text-2xl font-mono tracking-wider`}
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className={`w-full ${colors.button} text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200`}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={resendOtp}
              disabled={isLoading}
              className={`${colors.text} font-medium underline`}
            >
              Resend verification code
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              ← Back to registration form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}