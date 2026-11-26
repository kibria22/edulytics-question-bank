'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Loader2 } from 'lucide-react';
import { CurriculumNode } from '@/lib/types';

export default function CurriculumPage() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [nodes, setNodes] = useState<CurriculumNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<CurriculumNode[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAIConfig = async () => {
    try {
      const response = await fetch('/api/ai/check');
      const data = await response.json();
      setAiConfigured(data.configured);
    } catch (error) {
      console.error('AI config check error:', error);
    }
  };

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
    checkAIConfig();
    loadRootNodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedNode = selectedPath[selectedPath.length - 1];

  return (
    <AppShell
      language={language}
      onLanguageChange={setLanguage}
      aiConfigured={aiConfigured}
    >
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Browser</h1>
          <p className="text-muted-foreground mt-1">
            Navigate through curriculum structure and view learning outcomes
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBreadcrumbClick(-1)}
            className={selectedPath.length === 0 ? 'font-semibold' : ''}
          >
            Root
          </Button>
          {selectedPath.map((node, index) => (
            <div key={node._id.toString()} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBreadcrumbClick(index)}
                className={index === selectedPath.length - 1 ? 'font-semibold' : ''}
              >
                {node.name[language]}
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Node List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedPath.length === 0 ? 'Countries' : selectedNode?.name[language]}
              </CardTitle>
              <CardDescription>
                {selectedPath.length === 0
                  ? 'Select a country to browse curriculum'
                  : `Type: ${selectedNode?.type}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : nodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items found
                </div>
              ) : (
                <div className="space-y-2">
                  {nodes.map((node) => (
                    <Button
                      key={node._id.toString()}
                      variant="outline"
                      className="w-full justify-between h-auto py-3"
                      onClick={() => handleNodeClick(node)}
                    >
                      <div className="text-left">
                        <div className="font-medium">
                          {node.name[language]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {node.code} · {node.type}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail Panel */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedNode.summary?.[language] || 'No summary available'}
                  </p>
                </div>

                {selectedNode.learningOutcomes?.[language] &&
                  selectedNode.learningOutcomes[language].length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Learning Outcomes</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {selectedNode.learningOutcomes[language].map((outcome, index) => (
                            <li key={index} className="flex gap-2">
                              <span>•</span>
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-2">Metadata</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-mono">{selectedNode.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order:</span>
                      <span>{selectedNode.order}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedNode.isActive ? 'default' : 'secondary'}>
                        {selectedNode.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
