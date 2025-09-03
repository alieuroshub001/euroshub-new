"use client"
import Link, { LinkProps } from 'next/link';
import { ReactNode } from 'react';

interface LoadingLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function LoadingLink({ children, className, onClick, ...props }: LoadingLinkProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Loading will be automatically handled by NextLoadingProvider
  };

  return (
    <Link {...props} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}