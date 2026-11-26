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
import { useI18n } from '@/lib/i18n/context';

const navItems = [
  { icon: BookOpen, labelKey: 'sidebar.dashboard', href: '/curriculum' },
  { icon: Database, labelKey: 'sidebar.questionBank', href: '/questions' },
  { icon: FileEdit, labelKey: 'sidebar.questionEditor', href: '/editor' },
  { icon: Sparkles, labelKey: 'sidebar.aiGenerator', href: '/ai-generator' },
  { icon: FileQuestion, labelKey: 'sidebar.solutionsHints', href: '/solutions' },
  { icon: FileSpreadsheet, labelKey: 'sidebar.paperBuilder', href: '/paper-builder' },
  { icon: Library, labelKey: 'sidebar.sources', href: '/sources' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, language } = useI18n();

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
                  language === 'bn' && 'font-bengali',
                  isActive(item.href)
                    ? 'bg-edulytics-primary-light text-edulytics-primary font-medium'
                    : 'text-edulytics-text hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-edulytics-border">
        <p className={cn('text-xs text-edulytics-muted text-center', language === 'bn' && 'font-bengali')}>
          {t('common.developedBy')}
        </p>
      </div>
    </aside>
  );
}
