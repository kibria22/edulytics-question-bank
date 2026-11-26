'use client';

import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { ContentCard } from '@/components/edulytics/content-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Save } from 'lucide-react';

export default function SolutionsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Solutions & Hints"
        description="Manage answers, hints, and step-by-step solutions"
      />

      <ContentCard>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-edulytics-text">Answer</Label>
            <Textarea
              placeholder="Enter the answer (supports Markdown and LaTeX)"
              rows={4}
              className="font-bengali border-edulytics-border"
            />
            <p className="text-xs text-edulytics-muted">
              For MCQ: Select correct options. For written: Provide detailed answer.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-edulytics-text">Hints (Progressive)</Label>
            <Textarea
              placeholder="Enter hints, one per line"
              rows={3}
              className="font-bengali border-edulytics-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-edulytics-text">Step-by-Step Solution</Label>
            <Textarea
              placeholder="Enter detailed solution steps"
              rows={5}
              className="font-bengali border-edulytics-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-edulytics-text">Explanation</Label>
            <Textarea
              placeholder="Enter explanation"
              rows={3}
              className="font-bengali border-edulytics-border"
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 bg-edulytics-primary hover:bg-edulytics-primary/90 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Solution
            </Button>
            <Button variant="outline" className="flex-1 border-edulytics-primary/20 bg-edulytics-primary-light text-edulytics-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          </div>

          <div className="pt-2">
            <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
              Source: Manual / AI-assisted
            </Badge>
          </div>
        </div>
      </ContentCard>
    </AppShell>
  );
}
