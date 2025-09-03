"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Boxes } from '../ui/background-boxes';
import { FlipWords } from '../ui/flip-words';
import { cn } from '@/lib/utils';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  UserIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';

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

  const words = ["Success", "Growth", "Innovation", "Excellence", "Progress", "Opportunities", "Achievement", "Leadership", "Solutions", "Efficiency"];

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
      <div className="max-w-lg w-full space-y-8 relative z-20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Join <span className="text-cyan-400">EurosHub</span> for
            <FlipWords words={words} className="text-cyan-400" />
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Create your account to access the EurosHub Dashboard
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-6">
            {/* Role Selection with Icons */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-4">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={cn(
                    "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105",
                    role === 'client'
                      ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/25"
                      : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                  )}
                  onClick={() => setRole('client')}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <UserIcon className="h-8 w-8 text-indigo-400" />
                    <span className="text-sm font-medium text-white">Client</span>
                    <span className="text-xs text-gray-400 text-center">Business customer</span>
                  </div>
                </div>
                
                <div
                  className={cn(
                    "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105",
                    role === 'hr'
                      ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/25"
                      : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                  )}
                  onClick={() => setRole('hr')}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <UserGroupIcon className="h-8 w-8 text-green-400" />
                    <span className="text-sm font-medium text-white">HR</span>
                    <span className="text-xs text-gray-400 text-center">Human Resources</span>
                  </div>
                </div>
                
                <div
                  className={cn(
                    "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105",
                    role === 'employee'
                      ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/25"
                      : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                  )}
                  onClick={() => setRole('employee')}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <BriefcaseIcon className="h-8 w-8 text-blue-400" />
                    <span className="text-sm font-medium text-white">Employee</span>
                    <span className="text-xs text-gray-400 text-center">Team member</span>
                  </div>
                </div>
                
                <div
                  className={cn(
                    "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105",
                    role === 'admin'
                      ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/25"
                      : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                  )}
                  onClick={() => setRole('admin')}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <CogIcon className="h-8 w-8 text-red-400" />
                    <span className="text-sm font-medium text-white">Admin</span>
                    <span className="text-xs text-gray-400 text-center">System administrator</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                  Username
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-200 mb-2">
                  Full Name
                </label>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter full name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-200 mb-2">
                Phone Number
              </label>
              <input
                id="number"
                name="number"
                type="tel"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                placeholder="Enter phone number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                placeholder={
                  role === 'hr' || role === 'employee' 
                    ? "john.euroshub@gmail.com" 
                    : "Enter email address"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {(role === 'hr' || role === 'employee') && (
                <p className="mt-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-2 rounded-md border border-amber-400/20">
                  Must end with euroshub@gmail.com
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
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