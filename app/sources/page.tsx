'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { ContentCard } from '@/components/edulytics/content-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Library, Plus, Loader2, MoreVertical, BookOpen } from 'lucide-react';
import { QuestionSourceDoc } from '@/lib/types';

export default function SourcesPage() {
  const [sources, setSources] = useState<QuestionSourceDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

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
    <AppShell>
      <PageHeader
        title="Question Sources"
        description="Manage textbooks, exams, and other question sources"
        action={
          <Button className="bg-edulytics-primary hover:bg-edulytics-primary/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-edulytics-primary" />
        </div>
      ) : sources.length === 0 ? (
        <ContentCard>
          <div className="text-center py-12 text-edulytics-muted">
            <Library className="h-12 w-12 mx-auto mb-3 text-edulytics-muted/50" />
            <p className="text-sm">No sources found</p>
          </div>
        </ContentCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((source) => (
            <ContentCard key={source._id.toString()} className="flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-edulytics-text font-bengali">
                      {source.name.bn}
                    </div>
                    <div className="text-xs text-edulytics-muted uppercase">
                      {source.sourceKey}
                    </div>
                  </div>
                </div>
                <button className="text-edulytics-muted hover:text-edulytics-text">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  {source.type}
                </Badge>
                {source.year && (
                  <Badge variant="outline" className="text-xs border-edulytics-border">
                    {source.year}
                  </Badge>
                )}
                <Badge
                  className={`text-xs ${
                    source.isActive
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {source.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Details */}
              <div className="text-xs text-edulytics-muted space-y-1 mb-4">
                {source.country && <div>Country: {source.country}</div>}
                {source.publisher && <div>Publisher: {source.publisher}</div>}
              </div>

              {/* View Details Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-edulytics-primary/20 bg-edulytics-primary-light hover:bg-edulytics-primary-light/80 text-edulytics-primary text-xs mt-auto"
              >
                <Library className="h-3 w-3 mr-1.5" />
                View Details
              </Button>
            </ContentCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}
