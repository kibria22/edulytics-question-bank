'use client';

import { useState, useEffect } from 'react';
import { Question, QuestionSolution } from '@/lib/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, Edit, Flag, Clock, Calendar, BookOpen, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';

const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), { ssr: false });
const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), { ssr: false });

interface QuestionDetailDrawerProps {
  question: Question | null;
  onClose: () => void;
  onEdit?: (question: Question) => void;
}

export function QuestionDetailDrawer({ question, onClose, onEdit }: QuestionDetailDrawerProps) {
  const [solutions, setSolutions] = useState<QuestionSolution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);

  useEffect(() => {
    if (question) {
      loadSolutions(question._id.toString());
    }
  }, [question]);

  const loadSolutions = async (questionId: string) => {
    setLoadingSolutions(true);
    try {
      const response = await fetch(`/api/solutions?questionId=${questionId}`);
      const data = await response.json();
      setSolutions(data.solutions || []);
    } catch (error) {
      console.error('Error loading solutions:', error);
    } finally {
      setLoadingSolutions(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index}>{math}</BlockMath>;
      } else if (part.startsWith('$') && part.endsWith('$')) {
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

  if (!question) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[600px] bg-white border-l border-edulytics-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-edulytics-border">
        <h2 className="text-lg font-bold text-edulytics-text">Question Details</h2>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(question)}
              className="text-xs"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="text-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="solutions">Solutions ({solutions.length})</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {/* Type & Difficulty */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-semibold">
                {question.type.toUpperCase()}
              </Badge>
              {question.mcqKind && (
                <Badge variant="outline" className="text-xs">
                  {question.mcqKind.replace('_', ' ')}
                </Badge>
              )}
              {question.difficulty && (
                <Badge className={getDifficultyColor(question.difficulty)}>
                  {question.difficulty}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {question.language === 'bn' ? 'বাংলা' : question.language === 'en' ? 'English' : question.language}
              </Badge>
              {question.marks && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  {question.marks} marks
                </Badge>
              )}
            </div>

            {/* Question Stem */}
            <div className={question.language === 'bn' ? 'font-bengali' : ''}>
              <p className="font-semibold mb-2 text-sm text-edulytics-muted">Question:</p>
              <div className="text-sm text-edulytics-text p-3 bg-blue-50 border border-blue-200 rounded-lg">
                {renderMarkdown(question.stem)}
              </div>
            </div>

            {/* Stimulus (for CQ) */}
            {question.stimulus && (
              <div className={question.language === 'bn' ? 'font-bengali' : ''}>
                <p className="font-semibold mb-2 text-sm text-edulytics-muted">Stimulus:</p>
                <div className="text-sm text-edulytics-text p-3 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap">
                  {renderMarkdown(question.stimulus)}
                </div>
              </div>
            )}

            {/* MCQ Options */}
            {question.options && question.options.length > 0 && (
              <div className={question.language === 'bn' ? 'font-bengali' : ''}>
                <p className="font-semibold mb-2 text-sm text-edulytics-muted">Options:</p>
                <div className="space-y-2">
                  {question.options.map((opt) => {
                    // Find if this option is correct from solutions
                    const mcqSolution = solutions.find(s => s.partKey === 'main');
                    const isCorrect = mcqSolution?.answer && 
                      typeof mcqSolution.answer === 'object' &&
                      'correctOptionKeys' in mcqSolution.answer &&
                      mcqSolution.answer.correctOptionKeys?.includes(opt.key);

                    return (
                      <div
                        key={opt.key}
                        className={`flex gap-3 text-sm p-2.5 rounded border ${
                          isCorrect
                            ? 'bg-green-50 border-green-300 font-medium'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <span className="font-semibold min-w-[24px]">{opt.key}.</span>
                        <span className="flex-1">{renderMarkdown(opt.text)}</span>
                        {isCorrect && (
                          <Badge className="bg-green-600 text-white text-xs">✓ Correct</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Multi-statement MCQ */}
            {question.statements && question.statements.length > 0 && (
              <div className={question.language === 'bn' ? 'font-bengali' : ''}>
                <p className="font-semibold mb-2 text-sm text-edulytics-muted">Statements:</p>
                <div className="space-y-2">
                  {question.statements.map((stmt) => (
                    <div key={stmt.key} className="flex gap-3 text-sm p-2.5 bg-gray-50 border border-gray-200 rounded">
                      <span className="font-semibold">{stmt.key}.</span>
                      <span>{renderMarkdown(stmt.text)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CQ Parts */}
            {question.parts && question.parts.length > 0 && (
              <div className={question.language === 'bn' ? 'font-bengali' : ''}>
                <p className="font-semibold mb-2 text-sm text-edulytics-muted">Parts:</p>
                <div className="space-y-3">
                  {question.parts.map((part) => (
                    <div key={part.key} className="p-3 bg-gray-50 border border-gray-200 rounded">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-sm">{part.key}.</span>
                        {part.marks && (
                          <Badge variant="outline" className="text-xs">
                            {part.marks} marks
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">{renderMarkdown(part.prompt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Solutions Tab */}
          <TabsContent value="solutions" className="space-y-4">
            {loadingSolutions ? (
              <div className="text-center py-12 text-edulytics-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edulytics-primary mx-auto"></div>
                <p className="text-sm mt-3">Loading solutions...</p>
              </div>
            ) : solutions.length === 0 ? (
              <div className="text-center py-12 text-edulytics-muted">
                <FileText className="h-12 w-12 mx-auto mb-3 text-edulytics-muted/50" />
                <p className="text-sm">No solutions available for this question</p>
              </div>
            ) : (
              solutions.map((solution) => (
                <div key={solution._id.toString()} className="border border-edulytics-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="font-semibold">
                      Part: {solution.partKey}
                    </Badge>
                    {solution.answerSource === 'computed' && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                        Computed, not printed
                      </Badge>
                    )}
                  </div>

                  {/* Answer */}
                  {solution.answer && (
                    <div className="mb-3">
                      <p className="font-semibold text-xs text-edulytics-muted mb-1">Answer:</p>
                      <div className="text-sm p-2 bg-green-50 border border-green-200 rounded">
                        {typeof solution.answer === 'string'
                          ? renderMarkdown(solution.answer)
                          : JSON.stringify(solution.answer)}
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  {solution.steps && solution.steps.length > 0 && (
                    <div className="mb-3">
                      <p className="font-semibold text-xs text-edulytics-muted mb-2">Step by step solution:</p>
                      <div className="space-y-2">
                        {solution.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-2 text-sm">
                            <span className="font-semibold text-edulytics-primary min-w-[20px]">
                              {idx + 1}.
                            </span>
                            <span className="flex-1">{renderMarkdown(step)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hints */}
                  {solution.hints && solution.hints.length > 0 && (
                    <div className="mb-3">
                      <p className="font-semibold text-xs text-edulytics-muted mb-1">Hints:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {solution.hints.map((hint, idx) => (
                          <li key={idx}>{renderMarkdown(hint)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Explanation */}
                  {solution.explanation && (
                    <div className="mb-3">
                      <p className="font-semibold text-xs text-edulytics-muted mb-1">Explanation:</p>
                      <div className="text-sm text-gray-700">
                        {renderMarkdown(solution.explanation)}
                      </div>
                    </div>
                  )}

                  {/* Source/Method */}
                  {solution.answerSource && solution.answerSource !== 'computed' && (
                    <div className="text-xs text-edulytics-muted mt-2">
                      Method: {solution.answerSource}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-4">
            {/* Sources */}
            {question.sources && question.sources.length > 0 && (
              <div>
                <p className="font-semibold mb-2 text-sm text-edulytics-muted flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Sources
                </p>
                <div className="space-y-2">
                  {question.sources.map((source, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {source.type}
                        </Badge>
                        {source.board && <Badge variant="outline">{source.board}</Badge>}
                        {source.year && <Badge variant="outline">{source.year}</Badge>}
                      </div>
                      {source.page && <div className="text-edulytics-muted">Page: {source.page}</div>}
                      {source.ref && <div className="text-edulytics-muted">Ref: {source.ref}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            {question.difficulty && (
              <div>
                <p className="font-semibold mb-2 text-sm text-edulytics-muted">Difficulty</p>
                <Badge className={getDifficultyColor(question.difficulty)}>
                  {question.difficulty}
                </Badge>
              </div>
            )}

            {/* Dates */}
            <div>
              <p className="font-semibold mb-2 text-sm text-edulytics-muted flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </p>
              <div className="space-y-1 text-xs text-edulytics-muted">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Created: {new Date(question.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Updated: {new Date(question.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Report Error Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              <Flag className="h-3.5 w-3.5 mr-2" />
              Report Error
            </Button>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
