'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  GraduationCap,
  Users,
  UserCheck,
  FileText,
  Calendar,
  ChevronDown,
  ChevronRight,
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
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Settings, label: 'School Setup', href: '/school-setup' },
  { icon: GraduationCap, label: 'AI Agent', href: '/ai-agent' },
  { icon: Users, label: 'Students', href: '/students' },
  { icon: UserCheck, label: 'Teachers', href: '/teachers' },
  { icon: Users, label: 'Staffs', href: '/staffs' },
  { icon: FileText, label: 'Notices', href: '/notices' },
  { icon: Calendar, label: 'Attendance', href: '/attendance' },
  { icon: FileText, label: 'Fee Manage', href: '/fee-manage' },
];

const academicSubItems = [
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
  const [academicOpen, setAcademicOpen] = useState(true);

  const isActive = (href: string) => pathname === href;
  const isAcademicActive = academicSubItems.some((item) => pathname === item.href);

  return (
    <aside className="w-60 bg-white border-r border-edulytics-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-edulytics-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-edulytics-primary rounded flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
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

          {/* Academic Group */}
          <div>
            <button
              onClick={() => setAcademicOpen(!academicOpen)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isAcademicActive
                  ? 'bg-edulytics-primary-light text-edulytics-primary font-medium'
                  : 'text-edulytics-text hover:bg-gray-50'
              )}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Academic</span>
              {academicOpen ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
            </button>

            {academicOpen && (
              <div className="ml-3 mt-0.5 border-l-2 border-gray-200 pl-3 space-y-0.5">
                {academicSubItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-edulytics-primary-light text-edulytics-primary font-medium'
                          : 'text-edulytics-muted hover:bg-gray-50 hover:text-edulytics-text'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
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
