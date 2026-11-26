'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { ContentCard } from '@/components/edulytics/content-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Plus, Download, Trash2 } from 'lucide-react';

export default function PaperBuilderPage() {
  const [sections, setSections] = useState([
    { title: 'MCQ Section', type: 'mcq', count: 10, marks: 10 },
    { title: 'Creative Questions', type: 'cq', count: 5, marks: 50 },
  ]);

  const addSection = () => {
    setSections([...sections, { title: 'New Section', type: 'mcq', count: 5, marks: 5 }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const totalMarks = sections.reduce((sum, s) => sum + s.marks, 0);

  return (
    <AppShell>
      <PageHeader
        title="Paper Builder"
        description="Build exam papers using blueprint specifications"
      />

      <ContentCard>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-edulytics-text">Paper Title</Label>
              <Input
                placeholder="e.g., Class 9 Math - Final Exam 2024"
                className="h-9 font-bengali border-edulytics-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-edulytics-text">Duration (minutes)</Label>
              <Input
                type="number"
                defaultValue="180"
                className="h-9 border-edulytics-border"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-edulytics-text">Sections</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addSection}
                className="border-edulytics-border"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Add Section
              </Button>
            </div>

            {sections.map((section, index) => (
              <ContentCard key={index} className="bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-edulytics-muted">Section Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[index].title = e.target.value;
                          setSections(newSections);
                        }}
                        className="h-8 font-bengali border-edulytics-border text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-edulytics-muted">Type</Label>
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
                        <SelectTrigger className="h-8 border-edulytics-border text-xs">
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
                    <div className="space-y-1">
                      <Label className="text-xs text-edulytics-muted">Questions</Label>
                      <Input
                        type="number"
                        value={section.count}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[index].count = parseInt(e.target.value) || 0;
                          setSections(newSections);
                        }}
                        className="h-8 border-edulytics-border text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeSection(index)}
                    className="h-8 w-8 mt-5 border-edulytics-border"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </ContentCard>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-edulytics-primary-light rounded-lg">
            <span className="font-semibold text-sm text-edulytics-text">Total Marks:</span>
            <span className="text-2xl font-bold text-edulytics-primary">{totalMarks}</span>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 bg-edulytics-primary hover:bg-edulytics-primary/90 text-white">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Build Paper
            </Button>
            <Button variant="outline" className="flex-1 border-edulytics-border">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </ContentCard>
    </AppShell>
  );
}
