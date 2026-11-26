'use client';

import { Bell, HelpCircle, Globe, StickyNote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function TopBar() {
  return (
    <div className="h-16 bg-white border-b border-edulytics-border flex items-center justify-between px-6">
      <div>
        <h2 className="text-base font-bold text-edulytics-text">Welcome back, Admin User</h2>
        <p className="text-xs text-edulytics-muted">Here is what is happening at your school today</p>
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
        
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5 text-edulytics-muted" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-edulytics-primary text-white text-sm">
            AU
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
