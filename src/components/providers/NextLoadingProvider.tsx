"use client"
import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function LoadingProviderInner({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const startLoading = () => {
      setIsLoading(true);
    };

    // Override the Next.js router methods
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function(data, unused, url) {
      startLoading();
      originalPush.call(this, data, unused, url);
    };

    window.history.replaceState = function(data, unused, url) {
      startLoading();
      originalReplace.call(this, data, unused, url);
    };

    // Listen for popstate (back/forward buttons)
    const handlePopState = () => {
      startLoading();
    };

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
        startLoading();
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  // Stop loading when pathname or searchParams change (navigation completed)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {children}
    </>
  );
}

export default function NextLoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LoadingProviderInner>
        {children}
      </LoadingProviderInner>
    </Suspense>
  );
}