'use client';

import { Bell, HelpCircle, Globe, StickyNote, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n/context';

export function TopBar() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="h-16 bg-white border-b border-edulytics-border flex items-center justify-between px-6">
      <div>
        <h2 className="text-base font-bold text-edulytics-text">{t('common.welcome')}, Admin User</h2>
        <p className="text-xs text-edulytics-muted">{t('common.welcomeMessage')}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <StickyNote className="h-5 w-5 text-edulytics-muted" />
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-edulytics-muted" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-edulytics-red rounded-full"></span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5 text-edulytics-muted" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 transition-colors">
            <Globe className="h-5 w-5 text-edulytics-muted" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className="cursor-pointer"
            >
              <span className="flex-1">English</span>
              {language === 'en' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage('bn')}
              className="cursor-pointer font-bengali"
            >
              <span className="flex-1">বাংলা</span>
              {language === 'bn' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin User" />
          <AvatarFallback className="bg-edulytics-primary text-white text-sm">
            AU
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
