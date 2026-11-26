'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Database,
  FileEdit,
  Sparkles,
  FileQuestion,
  FileSpreadsheet,
  Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: BookOpen, label: 'Curriculum', href: '/curriculum' },
  { icon: Database, label: 'Question Bank', href: '/questions' },
  { icon: FileEdit, label: 'Question Editor', href: '/editor' },
  { icon: Sparkles, label: 'AI Generator', href: '/ai-generator' },
  { icon: FileQuestion, label: 'Solutions & Hints', href: '/solutions' },
  { icon: FileSpreadsheet, label: 'Paper Builder', href: '/paper-builder' },
  { icon: Library, label: 'Sources', href: '/sources' },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-60 bg-white border-r border-edulytics-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-edulytics-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L2 9L12 15L22 9L12 3Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 15L12 21L22 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 18L22 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-sm text-edulytics-text">Edulytics Academy</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive(item.href)
                    ? 'bg-edulytics-primary-light text-edulytics-primary font-medium'
                    : 'text-edulytics-text hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-edulytics-border">
        <p className="text-xs text-edulytics-muted text-center">
          Developed by Edulytics
        </p>
      </div>
    </aside>
  );
}
