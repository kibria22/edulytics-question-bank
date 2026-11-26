import { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-edulytics-border p-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        {children}
      </div>
    </div>
  );
}
