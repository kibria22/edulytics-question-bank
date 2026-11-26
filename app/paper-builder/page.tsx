'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Plus, Download } from 'lucide-react';

export default function PaperBuilderPage() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [sections, setSections] = useState([
    { title: 'MCQ Section', type: 'mcq', count: 10, marks: 10 },
    { title: 'Creative Questions', type: 'cq', count: 5, marks: 50 },
  ]);

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

  const addSection = () => {
    setSections([...sections, { title: 'New Section', type: 'mcq', count: 5, marks: 5 }]);
  };

  const totalMarks = sections.reduce((sum, s) => sum + s.marks, 0);

  return (
    <AppShell language={language} onLanguageChange={setLanguage} aiConfigured={aiConfigured}>
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            Paper Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Build exam papers using blueprint specifications
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paper Configuration</CardTitle>
            <CardDescription>Define sections and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paper Title</Label>
                <Input
                  placeholder="e.g., Class 9 Math - Final Exam 2024"
                  className={language === 'bn' ? 'font-bengali' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" defaultValue="180" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Sections</Label>
                <Button variant="outline" size="sm" onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {sections.map((section, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs">Section Title</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[index].title = e.target.value;
                            setSections(newSections);
                          }}
                          className={language === 'bn' ? 'font-bengali' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={section.type}
                          onValueChange={(val) => {
                            if (val) {
                              const newSections = [...sections];
                              newSections[index].type = val;
                              setSections(newSections);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">MCQ</SelectItem>
                            <SelectItem value="cq">CQ</SelectItem>
                            <SelectItem value="sq">SQ</SelectItem>
                            <SelectItem value="short">Short</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Questions</Label>
                        <Input
                          type="number"
                          value={section.count}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[index].count = parseInt(e.target.value) || 0;
                            setSections(newSections);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-semibold">Total Marks:</span>
              <span className="text-2xl font-bold text-primary">{totalMarks}</span>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Build Paper
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
