'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Eye } from 'lucide-react';
import { Question } from '@/lib/types';
import dynamic from 'next/dynamic';

const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), { ssr: false });
const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), { ssr: false });

export default function QuestionsPage() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    checkAIConfig();
    loadQuestions();
  }, [page, typeFilter, difficultyFilter]);

  const checkAIConfig = async () => {
    try {
      const response = await fetch('/api/ai/check');
      const data = await response.json();
      setAiConfigured(data.configured);
    } catch (error) {
      console.error('AI config check error:', error);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(difficultyFilter !== 'all' && { difficulty: difficultyFilter }),
        ...(search && { search }),
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

  return (
    <AppShell language={language} onLanguageChange={setLanguage} aiConfigured={aiConfigured}>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-1">
            Browse and search questions with filters
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadQuestions()}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={(val) => val && setTypeFilter(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="cq">CQ</SelectItem>
                  <SelectItem value="sq">SQ</SelectItem>
                  <SelectItem value="tf">True/False</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={(val) => val && setDifficultyFilter(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadQuestions} className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Questions ({total})
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / 20)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No questions found
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <Card key={question._id.toString()} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{question.type.toUpperCase()}</Badge>
                            {question.difficulty && (
                              <Badge
                                variant={
                                  question.difficulty === 'easy'
                                    ? 'default'
                                    : question.difficulty === 'medium'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {question.difficulty}
                              </Badge>
                            )}
                            <Badge variant="outline" className="font-bengali">
                              {question.language === 'bn' ? 'বাংলা' : 'English'}
                            </Badge>
                          </div>
                          <div className={question.language === 'bn' ? 'font-bengali' : ''}>
                            {renderMarkdown(question.stem)}
                          </div>
                          {question.marks && (
                            <div className="text-sm text-muted-foreground">
                              Marks: {question.marks}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && questions.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground px-4">
                  Page {page}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedQuestion && (
              <div className="space-y-4 p-4">
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedQuestion.type.toUpperCase()}</Badge>
                  {selectedQuestion.difficulty && (
                    <Badge>{selectedQuestion.difficulty}</Badge>
                  )}
                </div>
                <div className={selectedQuestion.language === 'bn' ? 'font-bengali' : ''}>
                  <p className="font-semibold mb-2">Question:</p>
                  <p>{renderMarkdown(selectedQuestion.stem)}</p>
                </div>
                {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                  <div className={selectedQuestion.language === 'bn' ? 'font-bengali' : ''}>
                    <p className="font-semibold mb-2">Options:</p>
                    <div className="space-y-1">
                      {selectedQuestion.options.map((opt) => (
                        <div key={opt.key} className="flex gap-2">
                          <span className="font-semibold">{opt.key}.</span>
                          <span>{renderMarkdown(opt.text)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedQuestion.parts && selectedQuestion.parts.length > 0 && (
                  <div className={selectedQuestion.language === 'bn' ? 'font-bengali' : ''}>
                    <p className="font-semibold mb-2">Parts:</p>
                    <div className="space-y-2">
                      {selectedQuestion.parts.map((part) => (
                        <div key={part.key}>
                          <span className="font-semibold">{part.key}. </span>
                          <span>{renderMarkdown(part.prompt)}</span>
                          {part.marks && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({part.marks} marks)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
