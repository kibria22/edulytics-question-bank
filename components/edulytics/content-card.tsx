import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  children: ReactNode;
  className?: string;
}

export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-edulytics-border p-4',
        className
      )}
    >
      {children}
    </div>
  );
}
