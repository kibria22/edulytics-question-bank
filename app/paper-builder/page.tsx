'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { ContentCard } from '@/components/edulytics/content-card';
import { QuestionFilters, QuestionFilterValues } from '@/components/edulytics/question-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Plus, Download, Trash2, BookOpen, Eye } from 'lucide-react';
import { Question } from '@/lib/types';
import dynamic from 'next/dynamic';

const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), { ssr: false });

export default function PaperBuilderPage() {
  const [sections, setSections] = useState([
    { title: 'MCQ Section', type: 'mcq', count: 10, marks: 10 },
    { title: 'Creative Questions', type: 'cq', count: 5, marks: 50 },
  ]);
  const [filterValues, setFilterValues] = useState<QuestionFilterValues>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  useEffect(() => {
    if (showQuestionPicker) {
      loadQuestions();
    }
  }, [showQuestionPicker]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
      });

      Object.entries(filterValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/questions?${params}`);
      const data = await response.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadQuestions();
  };

  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\$[^$]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        return <InlineMath key={index}>{math}</InlineMath>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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

      {!showQuestionPicker ? (
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
            <Button 
              className="flex-1 bg-edulytics-primary hover:bg-edulytics-primary/90 text-white"
              onClick={() => setShowQuestionPicker(true)}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Pick Questions
            </Button>
            <Button variant="outline" className="flex-1 border-edulytics-border">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </ContentCard>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-edulytics-text">Select Questions</h3>
            <Button
              variant="outline"
              onClick={() => setShowQuestionPicker(false)}
              className="border-edulytics-border"
            >
              Back to Builder
            </Button>
          </div>

          <QuestionFilters
            values={filterValues}
            onChange={setFilterValues}
            onSearch={handleSearch}
            resultCount={total}
          />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-edulytics-primary border-t-transparent rounded-full" />
            </div>
          ) : questions.length === 0 ? (
            <ContentCard>
              <div className="text-center py-12 text-edulytics-muted">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-edulytics-muted/50" />
                <p className="text-sm">No questions found</p>
              </div>
            </ContentCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.map((question) => (
                <ContentCard key={question._id.toString()} className="flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-edulytics-text">
                          {question.type.toUpperCase()}
                        </div>
                        <div className="text-xs text-edulytics-muted uppercase">
                          {question.language === 'bn' ? 'BANGLA' : 'ENGLISH'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {question.difficulty && (
                    <Badge className={`text-xs mb-3 w-fit ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </Badge>
                  )}

                  <div className={`text-sm text-edulytics-text mb-3 line-clamp-3 ${question.language === 'bn' ? 'font-bengali' : ''}`}>
                    {renderMarkdown(question.stem)}
                  </div>

                  <div className="flex gap-2 mb-3 mt-auto">
                    {question.marks && (
                      <div className="flex-1 bg-purple-50 border border-purple-200 rounded p-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-600">{question.marks}</span>
                          </div>
                          <span className="text-xs text-edulytics-muted">Marks</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-edulytics-primary/20 bg-edulytics-primary-light hover:bg-edulytics-primary-light/80 text-edulytics-primary text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1.5" />
                    Add to Paper
                  </Button>
                </ContentCard>
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
