'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Save } from 'lucide-react';

export default function SolutionsPage() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [aiConfigured, setAiConfigured] = useState(false);

  useEffect(() => {
    checkAIConfig();
  }, []);

  const checkAIConfig = async () => {
    try {
      const response = await fetch('/api/ai/check');
      const data = await response.json();
      setAiConfigured(data.configured);
    } catch (error) {
      console.error('AI config check error:', error);
    }
  };

  return (
    <AppShell language={language} onLanguageChange={setLanguage} aiConfigured={aiConfigured}>
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Solutions & Hints</h1>
          <p className="text-muted-foreground mt-1">
            Manage answers, hints, and step-by-step solutions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solution Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                placeholder="Enter the answer (supports Markdown and LaTeX)"
                rows={4}
                className={language === 'bn' ? 'font-bengali' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label>Hints (Progressive)</Label>
              <Textarea
                placeholder="Enter hints, one per line"
                rows={3}
                className={language === 'bn' ? 'font-bengali' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label>Step-by-Step Solution</Label>
              <Textarea
                placeholder="Enter detailed solution steps"
                rows={5}
                className={language === 'bn' ? 'font-bengali' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                placeholder="Enter explanation"
                rows={3}
                className={language === 'bn' ? 'font-bengali' : ''}
              />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Solution
              </Button>
              {aiConfigured && (
                <Button variant="outline" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              )}
            </div>

            <div className="pt-2">
              <Badge variant="secondary">
                Source: {aiConfigured ? 'Manual / AI-assisted' : 'Manual'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
