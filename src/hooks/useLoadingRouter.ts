"use client"
import { useRouter } from 'next/navigation';

export function useLoadingRouter() {
  const router = useRouter();

  // The loading will be automatically handled by NextLoadingProvider
  // which listens to history changes, so we can just use the normal router
  return {
    push: router.push,
    replace: router.replace,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
  };
}