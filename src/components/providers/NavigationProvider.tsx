"use client"
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from './LoadingProvider';

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setLoading } = useLoading();
  const isNavigating = useRef(false);

  useEffect(() => {
    // Navigation completed, stop loading
    if (isNavigating.current) {
      setLoading(false);
      isNavigating.current = false;
    }
  }, [pathname, searchParams, setLoading]);

  useEffect(() => {
    const handleStart = () => {
      isNavigating.current = true;
      setLoading(true);
    };

    // Listen to route change events
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      handleStart();
      originalPushState.apply(this, args);
    };

    window.history.replaceState = function(...args) {
      handleStart();
      originalReplaceState.apply(this, args);
    };

    // Listen to back/forward button
    window.addEventListener('popstate', handleStart);

    // Listen to link clicks - improved detection
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && link.href !== window.location.href) {
        // Check if it's an internal link and not opening in new tab
        if (link.href.startsWith(window.location.origin) && 
            !link.target && 
            !e.ctrlKey && 
            !e.metaKey && 
            !e.shiftKey) {
          handleStart();
        }
      }
    };

    // Listen to form submissions that might trigger navigation
    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (form && form.action && form.action !== window.location.href) {
        handleStart();
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('submit', handleFormSubmit, true);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleStart);
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, [setLoading]);

  return <>{children}</>;
}