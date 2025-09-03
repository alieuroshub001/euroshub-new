"use client"
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Boxes } from '../ui/background-boxes';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Now using the correct router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Get user session to determine role-based redirect
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      if (session?.user?.role) {
        router.push(`/${session.user.role}`);
      } else {
        router.push('/dashboard'); // Fallback
      }
    }
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      
      {/* Login Content */}
      <div className="max-w-6xl w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Quote Section */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 text-6xl text-cyan-400/20 font-serif">&quot;</div>
              <blockquote className="text-2xl md:text-3xl font-light text-white leading-relaxed italic pl-8">
                I have not failed. I&apos;ve just found 10,000 ways that won&apos;t work.
              </blockquote>
              <div className="absolute -bottom-4 -right-4 text-6xl text-cyan-400/20 font-serif rotate-180">&quot;</div>
            </div>
            <div className="flex items-center space-x-4 pl-8">
              <div className="w-12 h-0.5 bg-cyan-400"></div>
              <cite className="text-cyan-400 font-medium text-lg">Thomas Edison</cite>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed pl-8">
              Embrace innovation and persistence with <span className="text-cyan-400 font-semibold">EurosHub</span>. 
              Every challenge is an opportunity to grow and achieve excellence.
            </p>
          </div>

          {/* Login Form */}
          <div className="max-w-md w-full space-y-8 mx-auto lg:mx-0">
            
            {/* Mobile Quote - Visible only on mobile */}
            <div className="lg:hidden text-center space-y-4 mb-8">
              <blockquote className="text-lg font-light text-white leading-relaxed italic">
                &quot;I have not failed. I&apos;ve just found 10,000 ways that won&apos;t work.&quot;
              </blockquote>
              <cite className="text-cyan-400 font-medium">— Thomas Edison</cite>
            </div>

            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                Welcome to <span className="text-cyan-400">EurosHub</span>
              </h2>
              <p className="mt-2 text-center text-sm text-gray-300">
                Sign in to access your EurosHub Dashboard
              </p>
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md space-y-6">
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
                    className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 backdrop-blur-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02]'}`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
            
            <div className="text-sm text-center">
              <Link href="/auth/signup" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
  );

    </div>
  );
}
    

