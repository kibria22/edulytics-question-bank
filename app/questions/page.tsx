'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { ContentCard } from '@/components/edulytics/content-card';
import { QuestionFilters, QuestionFilterValues } from '@/components/edulytics/question-filters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Eye, MoreVertical, Plus, BookOpen } from 'lucide-react';
import { Question } from '@/lib/types';
import dynamic from 'next/dynamic';

const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), { ssr: false });

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<QuestionFilterValues>({});
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [page]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
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
    setPage(1);
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

  return (
    <AppShell>
      <PageHeader
        title="Question Bank"
        description="View and manage all questions offered across this school"
        action={
          <div className="flex gap-2">
            <Button
              variant={showAnswers ? "default" : "outline"}
              onClick={() => setShowAnswers(!showAnswers)}
              className={showAnswers ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </Button>
            <Button className="bg-edulytics-primary hover:bg-edulytics-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        }
      />

      <QuestionFilters
        values={filterValues}
        onChange={setFilterValues}
        onSearch={handleSearch}
        resultCount={total}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-edulytics-primary" />
        </div>
      ) : questions.length === 0 ? (
        <ContentCard>
          <div className="text-center py-12 text-edulytics-muted">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-edulytics-muted/50" />
            <p className="text-sm">No questions found</p>
          </div>
        </ContentCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((question) => (
              <ContentCard key={question._id.toString()} className="flex flex-col">
                {/* Header */}
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
                  <button className="text-edulytics-muted hover:text-edulytics-text">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Tags */}
                {question.difficulty && (
                  <Badge className={`text-xs mb-3 w-fit ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </Badge>
                )}

                {/* Question Stem */}
                <div className={`text-sm text-edulytics-text mb-3 line-clamp-3 ${question.language === 'bn' ? 'font-bengali' : ''}`}>
                  {renderMarkdown(question.stem)}
                </div>

                {/* Stats */}
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
                  {question.options && (
                    <div className="flex-1 bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {question.options.map((opt) => (
                            <div key={opt.key} className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">{opt.key}</span>
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-edulytics-muted">Options</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-edulytics-primary/20 bg-edulytics-primary-light hover:bg-edulytics-primary-light/80 text-edulytics-primary text-xs"
                  onClick={() => setSelectedQuestion(question)}
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Details
                </Button>
              </ContentCard>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="border-edulytics-border"
            >
              Previous
            </Button>
            <div className="text-sm text-edulytics-muted px-4">
              Page {page} of {Math.ceil(total / 20)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="border-edulytics-border"
            >
              Next
            </Button>
          </div>
        </>
      )}

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
                    <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                      {selectedQuestion.difficulty}
                    </Badge>
                  )}
                </div>
                <div className={selectedQuestion.language === 'bn' ? 'font-bengali' : ''}>
                  <p className="font-semibold mb-2 text-sm">Question:</p>
                  <p className="text-sm">{renderMarkdown(selectedQuestion.stem)}</p>
                </div>
                {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                  <div className={selectedQuestion.language === 'bn' ? 'font-bengali' : ''}>
                    <p className="font-semibold mb-2 text-sm">Options:</p>
                    <div className="space-y-1">
                      {selectedQuestion.options.map((opt) => (
                        <div key={opt.key} className="flex gap-2 text-sm">
                          <span className="font-semibold">{opt.key}.</span>
                          <span>{renderMarkdown(opt.text)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedQuestion.parts && selectedQuestion.parts.length > 0 && (
                  <div className={selectedQuestion.language === 'bn' ? 'font-bengali' : ''}>
                    <p className="font-semibold mb-2 text-sm">Parts:</p>
                    <div className="space-y-2">
                      {selectedQuestion.parts.map((part) => (
                        <div key={part.key} className="text-sm">
                          <span className="font-semibold">{part.key}. </span>
                          <span>{renderMarkdown(part.prompt)}</span>
                          {part.marks && (
                            <span className="text-xs text-edulytics-muted ml-2">
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
