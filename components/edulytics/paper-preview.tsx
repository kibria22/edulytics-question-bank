'use client';

import { useState } from 'react';
import { PaperConfig } from '@/app/paper-builder/page';
import { ContentCard } from './content-card';
import { Button } from '../ui/button';
import { Question } from '@/lib/types';
import { Printer, Download, Shuffle, Eye, EyeOff, GripVertical, RefreshCw, Flag } from 'lucide-react';
import dynamic from 'next/dynamic';

const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), { ssr: false });

interface PreviewProps {
  config: PaperConfig;
  onSwapQuestion: (sectionId: string, questionIndex: number) => void;
  onReorderQuestions: (sectionId: string, fromIndex: number, toIndex: number) => void;
}

const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliNumber(num: number): string {
  return String(num)
    .split('')
    .map(d => bengaliNumerals[parseInt(d)])
    .join('');
}

const mcqOptions = ['ক', 'খ', 'গ', 'ঘ'];

export function PaperPreview({ config, onSwapQuestion, onReorderQuestions }: PreviewProps) {
  const [showEditControls, setShowEditControls] = useState(true);
  const [draggedItem, setDraggedItem] = useState<{ sectionId: string; index: number } | null>(null);

  const renderMath = (text: string) => {
    const parts = text.split(/(\$[^$]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        return <InlineMath key={index}>{math}</InlineMath>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleDragStart = (sectionId: string, index: number) => {
    setDraggedItem({ sectionId, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (sectionId: string, dropIndex: number) => {
    if (draggedItem && draggedItem.sectionId === sectionId && draggedItem.index !== dropIndex) {
      onReorderQuestions(sectionId, draggedItem.index, dropIndex);
    }
    setDraggedItem(null);
  };

  const handlePrint = () => {
    setShowEditControls(false);
    setTimeout(() => {
      window.print();
      setShowEditControls(true);
    }, 100);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const hasQuestions = config.sections.some(s => s.questions.length > 0);

  if (!hasQuestions) {
    return (
      <div className="flex items-center justify-center h-full">
        <ContentCard className="max-w-md text-center">
          <div className="py-12">
            <Eye className="h-16 w-16 mx-auto mb-4 text-edulytics-muted/50" />
            <h3 className="text-lg font-bold text-edulytics-text mb-2 font-bengali">
              প্রশ্নপত্র প্রিভিউ
            </h3>
            <p className="text-sm text-edulytics-muted font-bengali">
              প্রশ্নপত্র তৈরি করার পর এখানে দেখতে পাবেন
            </p>
          </div>
        </ContentCard>
      </div>
    );
  }

  let questionNumber = 1;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditControls(!showEditControls)}
            className="border-edulytics-border font-bengali"
          >
            {showEditControls ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showEditControls ? 'এডিট মোড বন্ধ' : 'এডিট মোড চালু'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-edulytics-border font-bengali"
          >
            <Printer className="h-4 w-4 mr-2" />
            প্রিন্ট
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-edulytics-border font-bengali"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF ডাউনলোড
          </Button>
        </div>
      </div>

      {/* Paper Preview - Full Width A4 */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
        <div className="w-full p-12 print:p-8 font-bengali" style={{ fontFamily: 'Noto Sans Bengali, sans-serif', maxWidth: '210mm', margin: '0 auto' }}>
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            {config.schoolName && (
              <h1 className="text-2xl font-bold text-edulytics-text mb-2">
                {config.schoolName}
              </h1>
            )}
            <h2 className="text-xl font-bold text-edulytics-text mb-4">
              {config.paperTitle}
            </h2>
            
            <div className="flex justify-between items-center text-sm max-w-2xl mx-auto">
              <div className="text-left">
                {config.classId && (
                  <div>
                    <span className="font-semibold">শ্রেণি:</span>{' '}
                    <span>{/* Class name would go here */}</span>
                  </div>
                )}
                {config.duration && (
                  <div>
                    <span className="font-semibold">সময়:</span>{' '}
                    <span>{toBengaliNumber(config.duration)} মিনিট</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                {config.fullMarks && (
                  <div>
                    <span className="font-semibold">পূর্ণমান:</span>{' '}
                    <span className="text-lg">{toBengaliNumber(config.fullMarks)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sections */}
          {config.sections.map((section) => {
            if (section.questions.length === 0) return null;

            const totalMarks = section.marksEach * section.questionsNeeded;
            const sectionStartNumber = questionNumber;

            return (
              <div key={section.id} className="mb-8">
                {/* Section Header */}
                <div className="bg-gray-100 border-l-4 border-edulytics-primary p-3 mb-4 flex items-center justify-between print:bg-gray-200">
                  <h3 className="text-lg font-bold">{section.title}</h3>
                  <div className="text-sm">
                    <span className="font-semibold">মান:</span>{' '}
                    {toBengaliNumber(section.marksEach)} × {toBengaliNumber(section.questionsNeeded)} = {toBengaliNumber(totalMarks)}
                  </div>
                </div>

                {section.questionsToAnswer && section.questionsToAnswer < section.questionsNeeded && (
                  <p className="text-sm text-gray-600 mb-4 italic">
                    [যে কোনো {toBengaliNumber(section.questionsToAnswer)}টি প্রশ্নের উত্তর দাও।]
                  </p>
                )}

                {section.type === 'mcq' && (
                  <p className="text-xs text-gray-600 mb-4 italic">
                    [ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক।]
                  </p>
                )}

                {/* Questions */}
                <div className="space-y-6">
                  {section.questions.map((question, qIndex) => {
                    const currentNum = questionNumber++;
                    
                    return (
                      <div
                        key={question._id.toString()}
                        draggable={showEditControls}
                        onDragStart={() => handleDragStart(section.id, qIndex)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(section.id, qIndex)}
                        className={`relative group ${showEditControls ? 'cursor-move' : ''}`}
                      >
                        {showEditControls && (
                          <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                        )}

                        {/* MCQ Question */}
                        {section.type === 'mcq' && (
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <span className="font-bold text-base">
                                  {toBengaliNumber(currentNum)}.
                                </span>
                                <div className="flex-1">
                                  <div className="text-base mb-3">
                                    {renderMath(question.stem)}
                                  </div>
                                  
                                  {question.options && question.options.length > 0 && (
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 ml-4">
                                      {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex gap-2">
                                          <span>({mcqOptions[oIndex]})</span>
                                          <span>{renderMath(option.text)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-semibold w-8">
                              {toBengaliNumber(section.marksEach)}
                            </div>
                          </div>
                        )}

                        {/* CQ/Creative Question */}
                        {section.type === 'cq' && (
                          <div>
                            <div className="flex items-start gap-3 mb-3">
                              <span className="font-bold text-base">
                                {toBengaliNumber(currentNum)}.
                              </span>
                              <div className="flex-1 text-base">
                                {renderMath(question.stem)}
                              </div>
                            </div>
                            
                            {question.parts && question.parts.length > 0 && (
                              <div className="ml-6 space-y-2">
                                {question.parts.map((part, pIndex) => (
                                  <div key={pIndex} className="flex justify-between items-start">
                                    <div className="flex gap-2 flex-1">
                                      <span className="font-semibold">{mcqOptions[pIndex]}.</span>
                                      <span>{renderMath(part.prompt)}</span>
                                    </div>
                                    <span className="font-semibold text-right w-8">
                                      {toBengaliNumber(part.marks || 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Short/Long Questions */}
                        {(section.type === 'sq' || section.type === 'short' || section.type === 'long') && (
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <span className="font-bold text-base">
                                  {toBengaliNumber(currentNum)}.
                                </span>
                                <div className="flex-1 text-base">
                                  {renderMath(question.stem)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-semibold w-8">
                              {toBengaliNumber(section.marksEach)}
                            </div>
                          </div>
                        )}

                        {/* Edit Controls */}
                        {showEditControls && (
                          <div className="mt-2 flex items-center gap-2 print:hidden">
                            {question.difficulty && (
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(question.difficulty)}`}>
                                {question.difficulty}
                              </span>
                            )}
                            {question.sources && question.sources.length > 0 && question.sources[0].type && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                {question.sources[0].type}
                              </span>
                            )}
                            <div className="flex-1" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSwapQuestion(section.id, qIndex)}
                              className="h-7 text-xs hover:bg-blue-50 text-blue-600 font-bengali"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              বদলাও
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs hover:bg-red-50 text-red-600 font-bengali"
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              ভুল রিপোর্ট করুন
                            </Button>
                          </div>
                        )}

                        {/* Separator */}
                        {qIndex < section.questions.length - 1 && section.type === 'cq' && (
                          <div className="mt-4 border-t border-dashed border-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
