"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Boxes } from '../ui/background-boxes';
import { cn } from '@/lib/utils';

export default function Signup() {
  const [name, setName] = useState('');
  const [fullname, setFullname] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'client' | 'hr' | 'employee'>('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate euroshub email for hr/employee
    if ((role === 'hr' || role === 'employee') && !/\S+euroshub@gmail\.com$/.test(email)) {
      setError('HR and Employee must use euroshub email format (e.g., name.euroshub@gmail.com)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, fullname, number, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Redirect to OTP verification page with appropriate email
      const otpEmail = role === 'admin' ? data.data.adminOtpEmail || email : email;
      router.push(`/auth/verify-otp?email=${encodeURIComponent(otpEmail)}&type=verification&userEmail=${encodeURIComponent(email)}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      
      {/* Signup Form */}
      <div className="max-w-md w-full space-y-8 relative z-20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Join us and get started today
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-200">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="mt-1 block w-full px-3 py-3 bg-slate-800/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white backdrop-blur-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'client' | 'hr' | 'employee')}
              >
                <option value="client">Client</option>
                <option value="hr">HR</option>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="name" className="sr-only">
                Username
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm backdrop-blur-sm"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="fullname" className="sr-only">
                Full Name
              </label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm backdrop-blur-sm"
                placeholder="Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="number" className="sr-only">
                Phone Number
              </label>
              <input
                id="number"
                name="number"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm backdrop-blur-sm"
                placeholder="Phone Number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm backdrop-blur-sm"
                placeholder={
                  role === 'hr' || role === 'employee' 
                    ? "Email (e.g., john.euroshub@gmail.com)" 
                    : "Email address"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {(role === 'hr' || role === 'employee') && (
                <p className="mt-1 text-xs text-gray-400">
                  Must end with euroshub@gmail.com
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm backdrop-blur-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm backdrop-blur-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 backdrop-blur-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-indigo-500/25'}`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="text-sm text-center">
          <Link href="/auth/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}