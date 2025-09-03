"use client"
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentPath = useRef<string>('');

  useEffect(() => {
    const newPath = `${pathname}${searchParams.toString()}`;
    
    // Only hide loading if we've actually navigated to a different page
    if (currentPath.current && currentPath.current !== newPath && isLoading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Add a small delay to ensure page is fully rendered
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }
    
    currentPath.current = newPath;
  }, [pathname, searchParams, isLoading]);

  const setLoading = (loading: boolean) => {
    if (loading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsLoading(true);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {isLoading && <LoadingSpinner />}
      {children}
    </LoadingContext.Provider>
  );
}