'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PaperBuilderStepper } from '@/components/edulytics/paper-builder-stepper';
import { PaperPreview } from '@/components/edulytics/paper-preview';
import { Question } from '@/lib/types';

// Helper to get default section titles based on paper language
export function getDefaultSectionTitle(type: string, lang: 'en' | 'bn'): string {
  const titles: Record<string, Record<'en' | 'bn', string>> = {
    mcq: { en: 'Multiple Choice Questions', bn: 'বহুনির্বাচনি প্রশ্ন' },
    cq: { en: 'Creative Questions', bn: 'সৃজনশীল প্রশ্ন' },
    sq: { en: 'Short Questions', bn: 'সংক্ষিপ্ত প্রশ্ন' },
    short: { en: 'Short Questions', bn: 'ছোট প্রশ্ন' },
    long: { en: 'Long Questions', bn: 'বড় প্রশ্ন' },
  };
  return titles[type]?.[lang] || titles.mcq[lang];
}

function getInitialConfig(paperLang: 'en' | 'bn'): PaperConfig {
  return {
    paperType: 'exam',
    paperTitle: paperLang === 'bn' ? 'অর্ধবার্ষিক পরীক্ষা ২০২৬' : 'Half-yearly Exam 2026',
    paperLanguage: paperLang,
    schoolName: paperLang === 'bn' ? 'ঢাকা আদর্শ উচ্চ বিদ্যালয়' : 'Dhaka Model High School',
    duration: 180,
    fullMarks: 75,
    sections: [
      {
        id: '1',
        title: getDefaultSectionTitle('mcq', paperLang),
        type: 'mcq',
        questionsNeeded: 25,
        marksEach: 1,
        difficulty: 'mixed',
        questions: [],
      },
      {
        id: '2',
        title: getDefaultSectionTitle('cq', paperLang),
        type: 'cq',
        questionsNeeded: 5,
        questionsToAnswer: 5,
        marksEach: 10,
        difficulty: 'mixed',
        questions: [],
      },
    ],
  };
}

export interface PaperConfig {
  paperType: 'exam' | 'assignment';
  paperTitle: string;
  paperLanguage: 'en' | 'bn'; // Language of the paper content (not UI)
  schoolName?: string;
  examName?: string;
  duration?: number;
  fullMarks?: number;
  instructions?: string;
  dueDate?: string;
  
  boardId?: string;
  classId?: string;
  groupId?: string;
  subjectId?: string;
  chapterIds?: string[];
  topicIds?: string[];
  
  sections: PaperSection[];
}

export interface PaperSection {
  id: string;
  title: string;
  type: 'mcq' | 'cq' | 'sq' | 'short' | 'long';
  questionsNeeded: number;
  questionsToAnswer?: number;
  marksEach: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  questions: Question[];
}

export default function PaperBuilderPage() {
  const [config, setConfig] = useState<PaperConfig>(getInitialConfig('bn'));

  const [generating, setGenerating] = useState(false);

  // Auto-generate on mount if no questions exist
  useEffect(() => {
    const hasQuestions = config.sections.some(s => s.questions.length > 0);
    if (!hasQuestions && config.sections.length > 0) {
      // Small delay to ensure component is mounted
      setTimeout(() => handleGenerate(), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Generate questions for each section
      const updatedSections = await Promise.all(
        config.sections.map(async (section) => {
          const params = new URLSearchParams({
            type: section.type,
            limit: String(section.questionsNeeded * 3), // Get 3x for variety
          });

          if (config.subjectId) params.append('subjectId', config.subjectId);
          if (config.chapterIds?.length) {
            config.chapterIds.forEach(id => params.append('chapterIds', id));
          }
          if (config.topicIds?.length) {
            config.topicIds.forEach(id => params.append('topicIds', id));
          }
          if (section.difficulty && section.difficulty !== 'mixed') {
            params.append('difficulty', section.difficulty);
          }

          const response = await fetch(`/api/questions?${params}`);
          const data = await response.json();
          
          return {
            ...section,
            questions: (data.questions || []).slice(0, section.questionsNeeded),
          };
        })
      );

      setConfig({ ...config, sections: updatedSections });
    } catch (error) {
      console.error('Error generating paper:', error);
    } finally {
      setGenerating(false);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<PaperSection>) => {
    setConfig({
      ...config,
      sections: config.sections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const swapQuestion = async (sectionId: string, questionIndex: number) => {
    const section = config.sections.find(s => s.id === sectionId);
    if (!section) return;

    try {
      const params = new URLSearchParams({
        type: section.type,
        limit: '10',
      });

      if (config.subjectId) params.append('subjectId', config.subjectId);
      if (config.chapterIds?.length) {
        config.chapterIds.forEach(id => params.append('chapterIds', id));
      }

      const response = await fetch(`/api/questions?${params}`);
      const data = await response.json();
      
      // Find a question not already in this section
      const currentIds = section.questions.map(q => q._id.toString());
      const newQuestion = (data.questions || []).find(
        (q: Question) => !currentIds.includes(q._id.toString())
      );

      if (newQuestion) {
        const updatedQuestions = [...section.questions];
        updatedQuestions[questionIndex] = newQuestion;
        updateSection(sectionId, { questions: updatedQuestions });
      }
    } catch (error) {
      console.error('Error swapping question:', error);
    }
  };

  const reorderQuestions = (sectionId: string, fromIndex: number, toIndex: number) => {
    const section = config.sections.find(s => s.id === sectionId);
    if (!section) return;

    const questions = [...section.questions];
    const [moved] = questions.splice(fromIndex, 1);
    questions.splice(toIndex, 0, moved);
    
    updateSection(sectionId, { questions });
  };

  const totalMarks = config.sections.reduce(
    (sum, s) => sum + (s.marksEach * s.questionsNeeded), 
    0
  );

  const totalQuestions = config.sections.reduce(
    (sum, s) => sum + s.questionsNeeded, 
    0
  );

  const generatedCount = config.sections.reduce(
    (sum, s) => sum + s.questions.length, 
    0
  );

  return (
    <AppShell>
      <div className="flex gap-6 h-[calc(100vh-5rem)]">
        {/* Left Panel - Configuration Stepper */}
        <div className="w-[360px] flex-shrink-0 overflow-y-auto">
          <PaperBuilderStepper
            config={config}
            onChange={setConfig}
            onGenerate={handleGenerate}
            generating={generating}
            totalMarks={totalMarks}
            totalQuestions={totalQuestions}
            generatedCount={generatedCount}
          />
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 overflow-y-auto">
          <PaperPreview
            config={config}
            onSwapQuestion={swapQuestion}
            onReorderQuestions={reorderQuestions}
          />
        </div>
      </div>
    </AppShell>
  );
}
