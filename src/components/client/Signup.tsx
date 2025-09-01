'use client';

import { useState } from 'react';
import Link from 'next/link';
import VerifyOtp from '../global/VerifyOtp';

export default function ClientSignup() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'client',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  if (step === 'otp') {
    return <VerifyOtp email={formData.email} role="client" onBack={handleBackToForm} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤝</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Client Registration
            </h1>
            <p className="text-gray-600">
              Join as a valued client partner
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg mb-6">
            <div className="text-sm">
              <strong>Note:</strong> Your registration will require email verification and approval from admin or HR before account activation.
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="client@euroshub.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Register as Client'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">
              Already have a client account?
            </p>
            <Link
              href="/client/login"
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              Sign in here
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/signup"
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              ← Back to role selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}