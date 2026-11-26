'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { FilterBar } from '@/components/edulytics/filter-bar';
import { ContentCard } from '@/components/edulytics/content-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Loader2 } from 'lucide-react';
import { CurriculumNode } from '@/lib/types';

export default function CurriculumPage() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [nodes, setNodes] = useState<CurriculumNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<CurriculumNode[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRootNodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/curriculum/root');
      const data = await response.json();
      setNodes(data.nodes || []);
    } catch (error) {
      console.error('Error loading nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildren = async (parentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await response.json();
      return data.nodes || [];
    } catch (error) {
      console.error('Error loading children:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (node: CurriculumNode) => {
    const pathIndex = selectedPath.findIndex((n) => n._id.toString() === node._id.toString());

    if (pathIndex >= 0) {
      const newPath = selectedPath.slice(0, pathIndex + 1);
      setSelectedPath(newPath);
      const children = await loadChildren(node._id.toString());
      setNodes(children);
    } else {
      const newPath = [...selectedPath, node];
      setSelectedPath(newPath);
      const children = await loadChildren(node._id.toString());
      setNodes(children);
    }
  };

  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      setSelectedPath([]);
      await loadRootNodes();
    } else {
      const node = selectedPath[index];
      await handleNodeClick(node);
    }
  };

  useEffect(() => {
    loadRootNodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedNode = selectedPath[selectedPath.length - 1];

  return (
    <AppShell>
      <PageHeader
        title="Curriculum Browser"
        description="Navigate through curriculum structure and view learning outcomes"
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={language === 'bn' ? 'default' : 'outline'}
              onClick={() => setLanguage('bn')}
              className="font-bengali"
            >
              বাংলা
            </Button>
            <Button
              size="sm"
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
          </div>
        }
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-4 flex-wrap">
        <button
          onClick={() => handleBreadcrumbClick(-1)}
          className={`text-edulytics-muted hover:text-edulytics-primary ${
            selectedPath.length === 0 ? 'font-semibold text-edulytics-primary' : ''
          }`}
        >
          Root
        </button>
        {selectedPath.map((node, index) => (
          <div key={node._id.toString()} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-edulytics-muted" />
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`text-edulytics-muted hover:text-edulytics-primary ${
                index === selectedPath.length - 1 ? 'font-semibold text-edulytics-primary' : ''
              }`}
            >
              {node.name[language]}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Node List */}
        <ContentCard className="lg:col-span-2">
          <h2 className="text-base font-bold text-edulytics-text mb-1">
            {selectedPath.length === 0 ? 'Countries' : selectedNode?.name[language]}
          </h2>
          <p className="text-xs text-edulytics-muted mb-4">
            {selectedPath.length === 0
              ? 'Select a country to browse curriculum'
              : `Type: ${selectedNode?.type}`}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-edulytics-primary" />
            </div>
          ) : nodes.length === 0 ? (
            <div className="text-center py-12 text-edulytics-muted text-sm">
              No items found
            </div>
          ) : (
            <div className="space-y-2">
              {nodes.map((node) => (
                <button
                  key={node._id.toString()}
                  onClick={() => handleNodeClick(node)}
                  className="w-full flex items-center justify-between p-3 border border-edulytics-border rounded-lg hover:border-edulytics-primary hover:bg-edulytics-primary-light/30 transition-colors text-left"
                >
                  <div>
                    <div className="font-medium text-sm text-edulytics-text">
                      {node.name[language]}
                    </div>
                    <div className="text-xs text-edulytics-muted">
                      {node.code} · {node.type}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-edulytics-muted" />
                </button>
              ))}
            </div>
          )}
        </ContentCard>

        {/* Detail Panel */}
        {selectedNode && (
          <ContentCard>
            <h2 className="text-base font-bold text-edulytics-text mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-xs text-edulytics-muted uppercase mb-2">Summary</h3>
                <p className="text-sm text-edulytics-text">
                  {selectedNode.summary?.[language] || 'No summary available'}
                </p>
              </div>

              {selectedNode.learningOutcomes?.[language] &&
                selectedNode.learningOutcomes[language].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-xs text-edulytics-muted uppercase mb-2">
                      Learning Outcomes
                    </h3>
                    <ul className="space-y-1.5 text-sm text-edulytics-text">
                      {selectedNode.learningOutcomes[language].map((outcome, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-edulytics-primary">•</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="border-t border-edulytics-border pt-4">
                <h3 className="font-semibold text-xs text-edulytics-muted uppercase mb-2">Metadata</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-edulytics-muted">Code:</span>
                    <span className="font-mono text-edulytics-text">{selectedNode.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-edulytics-muted">Order:</span>
                    <span className="text-edulytics-text">{selectedNode.order}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-edulytics-muted">Status:</span>
                    <Badge
                      className={`text-xs ${
                        selectedNode.isActive
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {selectedNode.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </ContentCard>
        )}
      </div>
    </AppShell>
  );
}
