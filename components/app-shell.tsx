'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Database,
  FileEdit,
  Sparkles,
  FileText,
  FileSpreadsheet,
  Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const tabs = [
  { id: 'curriculum', label: 'Curriculum', icon: BookOpen, path: '/curriculum' },
  { id: 'questions', label: 'Question Bank', icon: Database, path: '/questions' },
  { id: 'editor', label: 'Question Editor', icon: FileEdit, path: '/editor' },
  { id: 'ai-generator', label: 'AI Generator', icon: Sparkles, path: '/ai-generator' },
  { id: 'solutions', label: 'Solutions & Hints', icon: FileText, path: '/solutions' },
  { id: 'paper-builder', label: 'Paper Builder', icon: FileSpreadsheet, path: '/paper-builder' },
  { id: 'sources', label: 'Sources', icon: Library, path: '/sources' },
];

interface AppShellProps {
  children: React.ReactNode;
  language: 'bn' | 'en';
  onLanguageChange: (lang: 'bn' | 'en') => void;
  aiConfigured: boolean;
}

export function AppShell({ children, language, onLanguageChange, aiConfigured }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Edulytics Question Bank</h1>
          <p className="text-sm text-muted-foreground mt-1">Internal Testing Tool</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.path;
            const isAI = tab.id === 'ai-generator';

            return (
              <Link key={tab.id} href={tab.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-secondary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {isAI && !aiConfigured && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      No Key
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={language === 'bn' ? 'default' : 'outline'}
              onClick={() => onLanguageChange('bn')}
              className="flex-1 font-bengali"
            >
              বাংলা
            </Button>
            <Button
              size="sm"
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => onLanguageChange('en')}
              className="flex-1"
            >
              English
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
