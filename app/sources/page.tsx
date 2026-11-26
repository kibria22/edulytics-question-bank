'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Library, Plus, Loader2 } from 'lucide-react';
import { QuestionSourceDoc } from '@/lib/types';

export default function SourcesPage() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [sources, setSources] = useState<QuestionSourceDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAIConfig();
    loadSources();
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

  const loadSources = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      setSources(data.sources || []);
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell language={language} onLanguageChange={setLanguage} aiConfigured={aiConfigured}>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Library className="h-8 w-8 text-primary" />
              Question Sources
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage textbooks, exams, and other question sources
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sources.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No sources found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source) => (
              <Card key={source._id.toString()} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className={`text-lg ${language === 'bn' ? 'font-bengali' : ''}`}>
                    {source.name[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{source.type}</Badge>
                    {source.year && <Badge variant="secondary">{source.year}</Badge>}
                    <Badge variant={source.isActive ? 'default' : 'secondary'}>
                      {source.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Key: {source.sourceKey}</div>
                    {source.country && <div>Country: {source.country}</div>}
                    {source.publisher && <div>Publisher: {source.publisher}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
