'use client';

import { useState } from 'react';
import { PaperConfig } from '@/app/paper-builder/page';
import { ContentCard } from './content-card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Question } from '@/lib/types';
import { Printer, Download, Eye, Settings2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), { ssr: false });

interface PreviewProps {
  config: PaperConfig;
  onSwapQuestion: (sectionId: string, questionIndex: number) => void;
  onReorderQuestions: (sectionId: string, fromIndex: number, toIndex: number) => void;
}

type MCQLayout = 'single-column-inline' | 'two-column-model' | 'auto';
type CQLayout = 'two-column-board' | 'single-column-full';

const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const bengaliOptions = ['ক', 'খ', 'গ', 'ঘ'];
const englishOptions = ['a', 'b', 'c', 'd'];

function toBengaliNumber(num: number): string {
  return String(num)
    .split('')
    .map(d => bengaliNumerals[parseInt(d)])
    .join('');
}

function formatNumber(num: number, language: 'en' | 'bn'): string {
  return language === 'bn' ? toBengaliNumber(num) : String(num);
}

export function PaperPreviewWithTabs({ config, onSwapQuestion, onReorderQuestions }: PreviewProps) {
  const { t, language: uiLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [mcqLayout, setMcqLayout] = useState<MCQLayout>('two-column-model');
  const [cqLayout, setCqLayout] = useState<CQLayout>('two-column-board');
  const [showSettings, setShowSettings] = useState(false);
  
  const paperLang = config.paperLanguage || 'bn';
  const options = paperLang === 'bn' ? bengaliOptions : englishOptions;

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

  // Group questions by type
  const mcqSections = config.sections.filter(s => s.type === 'mcq' && s.questions.length > 0);
  const cqSections = config.sections.filter(s => s.type === 'cq' && s.questions.length > 0);
  const shortSections = config.sections.filter(s => 
    (s.type === 'sq' || s.type === 'short') && s.questions.length > 0
  );
  
  const hasMCQ = mcqSections.length > 0;
  const hasCQ = cqSections.length > 0;
  const hasShort = shortSections.length > 0;

  const totalMCQMarks = mcqSections.reduce((sum, s) => sum + (s.marksEach * s.questionsNeeded), 0);
  const totalCQMarks = cqSections.reduce((sum, s) => sum + (s.marksEach * s.questionsNeeded), 0);
  const totalShortMarks = shortSections.reduce((sum, s) => sum + (s.marksEach * s.questionsNeeded), 0);

  const handlePrint = () => {
    window.print();
  };

  const renderHeader = (typeLabel: string, marks: number, duration?: number) => (
    <div className="text-center mb-6 print-header">
      <h1 className={cn("text-2xl font-bold mb-2", paperLang === 'bn' && 'font-bengali')}>
        {config.paperTitle}
      </h1>
      {config.schoolName && (
        <h2 className={cn("text-lg mb-2", paperLang === 'bn' && 'font-bengali')}>
          {config.schoolName}
        </h2>
      )}
      <div className={cn("flex justify-center gap-6 text-sm mb-2", paperLang === 'bn' && 'font-bengali')}>
        <div>
          <span className="font-semibold">
            {paperLang === 'bn' ? 'বিষয়' : 'Subject'}:
          </span> {typeLabel}
        </div>
        {duration && (
          <div>
            <span className="font-semibold">
              {paperLang === 'bn' ? 'সময়' : 'Time'}:
            </span> {formatNumber(duration, paperLang)} {paperLang === 'bn' ? 'মিনিট' : 'minutes'}
          </div>
        )}
        <div>
          <span className="font-semibold">
            {paperLang === 'bn' ? 'পূর্ণমান' : 'Full Marks'}:
          </span> {formatNumber(marks, paperLang)}
        </div>
      </div>
      <div className="border-t-2 border-black pt-2">
        <div className="flex justify-between text-xs">
          <div>{paperLang === 'bn' ? 'পরীক্ষার্থীর নাম' : 'Name'}: ...........................</div>
          <div>{paperLang === 'bn' ? 'রোল নম্বর' : 'Roll No'}: ...........................</div>
        </div>
      </div>
    </div>
  );

  const renderMCQSingleColumn = (sections: typeof mcqSections, startNumber = 1) => {
    let questionNumber = startNumber;
    return (
      <div className="space-y-3">
        {sections.map((section) =>
          section.questions.map((q) => {
            const currentNum = questionNumber++;
            return (
              <div key={q._id.toString()} className="mb-3">
                <div className={cn("flex gap-2", paperLang === 'bn' && 'font-bengali')}>
                  <span className="font-semibold min-w-[32px]">
                    {formatNumber(currentNum, paperLang)}.
                  </span>
                  <div className="flex-1">
                    <div className="mb-2">{renderMath(q.stem)}</div>
                    <div className="flex flex-wrap gap-4 ml-4">
                      {q.options?.map((opt, idx) => (
                        <span key={opt.key} className="inline-flex items-baseline gap-1">
                          <span className="font-semibold">({options[idx]})</span>
                          <span>{renderMath(opt.text)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderMCQTwoColumn = (sections: typeof mcqSections, startNumber = 1) => {
    let questionNumber = startNumber;
    return (
      <div className="two-column-mcq">
        {sections.map((section) =>
          section.questions.map((q) => {
            const currentNum = questionNumber++;
            return (
              <div key={q._id.toString()} className="break-inside-avoid mb-4">
                <div className={cn("", paperLang === 'bn' && 'font-bengali')}>
                  <div className="mb-2">
                    <span className="font-semibold">
                      {formatNumber(currentNum, paperLang)}.
                    </span> {renderMath(q.stem)}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 ml-4 text-sm">
                    {q.options?.map((opt, idx) => (
                      <div key={opt.key} className="flex items-baseline gap-1">
                        <span className="font-semibold">({options[idx]})</span>
                        <span>{renderMath(opt.text)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderCQTwoColumn = (sections: typeof cqSections, startNumber = 1) => {
    let questionNumber = startNumber;
    return (
      <div className="two-column-cq">
        {sections.map((section) =>
          section.questions.map((q) => {
            const currentNum = questionNumber++;
            return (
              <div key={q._id.toString()} className="break-inside-avoid mb-6">
                <div className={cn("", paperLang === 'bn' && 'font-bengali')}>
                  <div className="font-bold mb-2">
                    {formatNumber(currentNum, paperLang)}.
                  </div>
                  {q.stimulus && (
                    <div className="mb-3 p-3 bg-gray-50 rounded whitespace-pre-wrap text-sm">
                      {renderMath(q.stimulus)}
                    </div>
                  )}
                  {q.parts && q.parts.length > 0 && (
                    <div className="space-y-2 ml-4">
                      {q.parts.map((part) => (
                        <div key={part.key} className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-semibold">{part.key}.</span> {renderMath(part.prompt)}
                          </div>
                          {part.marks && (
                            <span className="text-sm font-semibold ml-2">
                              {formatNumber(part.marks, paperLang)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderCQSingleColumn = (sections: typeof cqSections, startNumber = 1) => {
    let questionNumber = startNumber;
    return (
      <div className="space-y-6">
        {sections.map((section) =>
          section.questions.map((q) => {
            const currentNum = questionNumber++;
            return (
              <div key={q._id.toString()} className="break-inside-avoid">
                <div className={cn("", paperLang === 'bn' && 'font-bengali')}>
                  <div className="font-bold text-lg mb-3">
                    {formatNumber(currentNum, paperLang)}.
                  </div>
                  {q.stimulus && (
                    <div className="mb-4 p-4 bg-gray-50 border-l-4 border-blue-500 whitespace-pre-wrap">
                      {renderMath(q.stimulus)}
                    </div>
                  )}
                  {q.parts && q.parts.length > 0 && (
                    <div className="space-y-3 ml-6">
                      {q.parts.map((part) => (
                        <div key={part.key} className="flex justify-between items-start">
                          <div className="flex-1 text-base">
                            <span className="font-semibold text-lg">{part.key}.</span> {renderMath(part.prompt)}
                          </div>
                          {part.marks && (
                            <span className="text-base font-semibold ml-4">
                              {formatNumber(part.marks, paperLang)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderShortQuestions = (sections: typeof shortSections, startNumber = 1) => {
    let questionNumber = startNumber;
    return (
      <div className="space-y-3">
        {sections.map((section) =>
          section.questions.map((q) => {
            const currentNum = questionNumber++;
            return (
              <div key={q._id.toString()} className="break-inside-avoid">
                <div className={cn("flex gap-2", paperLang === 'bn' && 'font-bengali')}>
                  <span className="font-semibold min-w-[32px]">
                    {formatNumber(currentNum, paperLang)}.
                  </span>
                  <div className="flex-1">{renderMath(q.stem)}</div>
                  {q.marks && (
                    <span className="font-semibold ml-2">
                      {formatNumber(q.marks, paperLang)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const hasQuestions = config.sections.some(s => s.questions.length > 0);

  if (!hasQuestions) {
    return (
      <div className="flex items-center justify-center h-full">
        <ContentCard className="max-w-md text-center">
          <div className="py-12">
            <Eye className="h-16 w-16 mx-auto mb-4 text-edulytics-muted/50" />
            <h3 className="text-lg font-bold text-edulytics-text mb-2">
              {t('paperBuilder.preview')}
            </h3>
            <p className="text-sm text-edulytics-muted">
              {t('paperBuilder.previewMessage')}
            </p>
          </div>
        </ContentCard>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b p-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings2 className="h-4 w-4 mr-2" />
            Layouts
          </Button>
        </div>
        
        {showSettings && (
          <div className="flex items-center gap-4">
            {hasMCQ && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">MCQ Layout:</span>
                <Select value={mcqLayout} onValueChange={(v) => setMcqLayout(v as MCQLayout)}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-column-inline">Single Column (Inline)</SelectItem>
                    <SelectItem value="two-column-model">Two Column (Model Test)</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {hasCQ && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">CQ Layout:</span>
                <Select value={cqLayout} onValueChange={(v) => setCqLayout(v as CQLayout)}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="two-column-board">Two Column (Board Style)</SelectItem>
                    <SelectItem value="single-column-full">Single Column (Full Width)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="print:hidden border-b rounded-none w-full justify-start bg-white">
          <TabsTrigger value="all">All ({config.fullMarks} marks)</TabsTrigger>
          {hasMCQ && <TabsTrigger value="mcq">MCQ ({totalMCQMarks} marks)</TabsTrigger>}
          {hasCQ && <TabsTrigger value="cq">CQ ({totalCQMarks} marks)</TabsTrigger>}
          {hasShort && <TabsTrigger value="short">Short ({totalShortMarks} marks)</TabsTrigger>}
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
          <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm print:shadow-none print:max-w-none">
            {renderHeader(paperLang === 'bn' ? 'সকল প্রশ্ন' : 'All Sections', config.fullMarks || 0, config.duration)}
            
            {hasMCQ && (
              <div className="mb-8">
                <h3 className={cn("text-lg font-bold mb-4", paperLang === 'bn' && 'font-bengali')}>
                  {paperLang === 'bn' ? 'বহুনির্বাচনি প্রশ্ন' : 'Multiple Choice Questions'}
                </h3>
                {mcqLayout === 'single-column-inline' ? renderMCQSingleColumn(mcqSections) : renderMCQTwoColumn(mcqSections)}
              </div>
            )}
            
            {hasCQ && (
              <div className="mb-8">
                <h3 className={cn("text-lg font-bold mb-4", paperLang === 'bn' && 'font-bengali')}>
                  {paperLang === 'bn' ? 'সৃজনশীল প্রশ্ন' : 'Creative Questions'}
                </h3>
                {cqLayout === 'two-column-board' ? renderCQTwoColumn(cqSections) : renderCQSingleColumn(cqSections)}
              </div>
            )}
            
            {hasShort && (
              <div className="mb-8">
                <h3 className={cn("text-lg font-bold mb-4", paperLang === 'bn' && 'font-bengali')}>
                  {paperLang === 'bn' ? 'সংক্ষিপ্ত প্রশ্ন' : 'Short Questions'}
                </h3>
                {renderShortQuestions(shortSections)}
              </div>
            )}
          </div>
        </TabsContent>

        {/* MCQ Tab */}
        {hasMCQ && (
          <TabsContent value="mcq" className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
            <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm print:shadow-none print:max-w-none">
              {renderHeader(
                paperLang === 'bn' ? 'বহুনির্বাচনি প্রশ্ন' : 'Multiple Choice Questions',
                totalMCQMarks,
                config.duration ? Math.ceil(config.duration * (totalMCQMarks / (config.fullMarks || 1))) : undefined
              )}
              {mcqLayout === 'single-column-inline' ? renderMCQSingleColumn(mcqSections) : renderMCQTwoColumn(mcqSections)}
            </div>
          </TabsContent>
        )}

        {/* CQ Tab */}
        {hasCQ && (
          <TabsContent value="cq" className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
            <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm print:shadow-none print:max-w-none">
              {renderHeader(
                paperLang === 'bn' ? 'সৃজনশীল প্রশ্ন' : 'Creative Questions',
                totalCQMarks,
                config.duration ? Math.ceil(config.duration * (totalCQMarks / (config.fullMarks || 1))) : undefined
              )}
              {cqLayout === 'two-column-board' ? renderCQTwoColumn(cqSections) : renderCQSingleColumn(cqSections)}
            </div>
          </TabsContent>
        )}

        {/* Short Tab */}
        {hasShort && (
          <TabsContent value="short" className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
            <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm print:shadow-none print:max-w-none">
              {renderHeader(
                paperLang === 'bn' ? 'সংক্ষিপ্ত প্রশ্ন' : 'Short Questions',
                totalShortMarks,
                config.duration ? Math.ceil(config.duration * (totalShortMarks / (config.fullMarks || 1))) : undefined
              )}
              {renderShortQuestions(shortSections)}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .two-column-mcq, .two-column-cq {
            column-count: 2;
            column-gap: 1.5rem;
            column-rule: 1px solid #e5e7eb;
          }
          
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          /* Only show the active tab content when printing */
          [role="tabpanel"][data-state="inactive"] {
            display: none !important;
          }
          
          .print-header {
            break-after: avoid;
            page-break-after: avoid;
          }
        }
        
        .two-column-mcq {
          column-count: 2;
          column-gap: 1.5rem;
          column-rule: 1px solid #e5e7eb;
        }
        
        .two-column-cq {
          column-count: 2;
          column-gap: 1.5rem;
          column-rule: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}
