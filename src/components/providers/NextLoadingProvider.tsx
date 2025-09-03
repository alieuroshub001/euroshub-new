"use client"
import { useEffect, useState, useRef, createContext, useContext } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LoadingContext = createContext({
  setLoading: (loading: boolean) => {}
});

export const useLoading = () => useContext(LoadingContext);

export default function NextLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = (loading: boolean) => {
    if (loading) {
      setIsLoading(true);
    } else {
      // Small delay to prevent flashing
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 150);
    }
  };

  useEffect(() => {
    // Listen for Next.js route changes
    const handleRouteChangeStart = () => setLoading(true);
    const handleRouteChangeComplete = () => setLoading(false);

    // Listen for link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const link = target.closest('a');
      
      if (link && 
          link.href && 
          link.href.startsWith(window.location.origin) &&
          link.href !== window.location.href &&
          !link.target &&
          !e.ctrlKey && 
          !e.metaKey && 
          !e.shiftKey &&
          e.button === 0) {
        setLoading(true);
        // Auto-hide after reasonable time if route change doesn't complete
        setTimeout(() => setLoading(false), 3000);
      }
    };

    // Listen for back/forward button navigation
    const handlePopState = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ setLoading }}>
      {isLoading && <LoadingSpinner />}
      {children}
    </LoadingContext.Provider>
  );
}